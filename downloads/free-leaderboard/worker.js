// Plate Club leaderboard for Cloudflare Workers Free + D1.
// Bind a D1 database under the variable name DB in the Worker dashboard.
const TABLE_SQL = `CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL
);`;
const LIMITS = new Map();
let schemaReady = false;

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function nameOrError(value) {
  if (typeof value !== "string") throw new Error("Имя должно быть текстом.");
  const name = value.trim();
  if ([...name].length < 2 || [...name].length > 24 || !/^[\p{L}\p{N} _-]+$/u.test(name)) {
    throw new Error("Имя: 2–24 символа, буквы, цифры, пробел, дефис или подчёркивание.");
  }
  return name;
}

function scoreOrError(stats) {
  const caps = { generated: 2000000, exchanged: 100000, cars: 36, legendary_generated: 2000000 };
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) throw new Error("Не передана статистика.");
  for (const [key, cap] of Object.entries(caps)) {
    if (!Number.isInteger(stats[key]) || stats[key] < 0 || stats[key] > cap) {
      throw new Error("Некорректная статистика.");
    }
  }
  if (stats.legendary_generated > stats.generated) throw new Error("Некорректное число легендарных номеров.");
  return stats.generated * 5 + stats.exchanged * 250 + stats.cars * 500 + stats.legendary_generated * 1000;
}

async function hashToken(token) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function limited(request, registration) {
  // A modest per-isolate throttle. Cloudflare may run several isolates, so this
  // is abuse friction, not a global quota or a substitute for account controls.
  const client = request.headers.get("CF-Connecting-IP") || "local";
  const now = Date.now();
  const windowMs = registration ? 3600000 : 60000;
  const maximum = registration ? 30 : 180;
  const key = `${client}/${registration ? "register" : "other"}`;
  let record = LIMITS.get(key);
  if (!record || now >= record.until) record = { count: 0, until: now + windowMs };
  record.count += 1;
  LIMITS.set(key, record);
  if (LIMITS.size > 4096) {
    for (const [entry, limit] of LIMITS) if (now >= limit.until) LIMITS.delete(entry);
    if (LIMITS.size > 4096) LIMITS.clear();
  }
  return record.count > maximum;
}

async function bodyOrError(request) {
  const body = await request.text();
  if (!body || new TextEncoder().encode(body).length > 8192) {
    const error = new Error("Неподходящий размер запроса.");
    error.status = 413;
    throw error;
  }
  const data = JSON.parse(body);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Ожидается объект JSON.");
  return data;
}

async function ensureTable(db) {
  if (!schemaReady) {
    await db.exec(TABLE_SQL);
    schemaReady = true;
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const registration = request.method === "POST" && path === "/v1/register";
    if (limited(request, registration)) return reply({ error: "Слишком много запросов. Попробуйте позже." }, 429);
    if (!env.DB) return reply({ error: "База D1 не подключена: добавьте binding с именем DB." }, 503);
    try {
      await ensureTable(env.DB);
      if (request.method === "GET" && path === "/health") {
        return reply({ ok: true, version: "2.1.0", storage: "D1" });
      }
      if (request.method === "GET" && path === "/v1/leaderboard") {
        const result = await env.DB.prepare(
          "SELECT id, name, score, updated FROM players ORDER BY score DESC, updated ASC, id ASC LIMIT 100"
        ).all();
        const players = result.results.map((player, index) => ({ ...player, rank: index + 1 }));
        return reply({ ok: true, players });
      }
      if (request.method !== "POST" || !["/v1/register", "/v1/score"].includes(path)) {
        return reply({ error: "Маршрут не найден." }, 404);
      }
      let data;
      try {
        data = await bodyOrError(request);
      } catch (error) {
        return reply({ error: error instanceof SyntaxError ? "Некорректный JSON." : error.message }, error.status || 400);
      }
      if (path === "/v1/register") {
        const name = nameOrError(data.name);
        const id = crypto.randomUUID().replaceAll("-", "");
        const token = newToken();
        await env.DB.prepare(
          "INSERT INTO players (id, token_hash, name, updated) VALUES (?, ?, ?, ?)"
        ).bind(id, await hashToken(token), name, Math.floor(Date.now() / 1000)).run();
        return reply({ ok: true, id, token }, 201);
      }
      const id = typeof data.id === "string" ? data.id : "";
      const token = request.headers.get("Authorization")?.match(/^Bearer ([A-Za-z0-9_-]{20,100})$/)?.[1] || "";
      if (!/^[a-f0-9]{32}$/.test(id) || !token) return reply({ error: "Профиль не авторизован." }, 401);
      const player = await env.DB.prepare("SELECT id, score FROM players WHERE id = ? AND token_hash = ?")
        .bind(id, await hashToken(token)).first();
      if (!player) return reply({ error: "Профиль не авторизован." }, 401);
      const name = nameOrError(data.name);
      const score = scoreOrError(data.stats);
      await env.DB.prepare("UPDATE players SET name = ?, score = MAX(score, ?), updated = ? WHERE id = ?")
        .bind(name, score, Math.floor(Date.now() / 1000), id).run();
      return reply({ ok: true, score: Math.max(score, player.score) });
    } catch (error) {
      if (error instanceof SyntaxError || (error instanceof Error && error.message.startsWith("Имя")) ||
          (error instanceof Error && (error.message.startsWith("Некоррект") || error.message.startsWith("Не передана")))) {
        return reply({ error: error.message }, 400);
      }
      return reply({ error: "База временно недоступна. Проверьте привязку DB." }, 503);
    }
  },
};
