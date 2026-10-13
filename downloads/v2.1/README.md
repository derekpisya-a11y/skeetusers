# Номерной клуб 2.1

Нативная игра Godot 4.6.3 для Android (вертикально) и Windows (широкое окно).

В коллекции появились флажки на карточках, «Продать выбранные» и «Продать все». Перед продажей показываются количество, сумма и предупреждение об эпических/легендарных номерах. Избранные, установленные и номера в сейфе защищены. «Выделить видимые» учитывает фильтры; «Продать все» включает всю доступную коллекцию. Продажи учитываются в заданиях.

## Скачать игру

- [PlateClub-Windows-x64.zip](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/PlateClub-Windows-x64.zip) — 36.4 МиБ
- [PlateClub-Android.apk](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/PlateClub-Android.apk) — 54.6 МиБ, устанавливается напрямую
- [PlateClub-Android.zip](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/PlateClub-Android.zip) — 54.1 МиБ, запасной архив
- [PlateClub-Godot-Source.zip](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/PlateClub-Godot-Source.zip) — 1.9 МиБ

Windows: распакуйте ZIP и запустите PlateClub.exe. Android: скачайте APK напрямую, откройте его через «Файлы» и разрешите этому приложению установку, если телефон попросит. Требуется Android 7.0+; поддерживаются arm64 и 32-битные ARM. Исправлены одинаковые адреса компонентов Android, мешавшие установке. APK подписан тем же тестовым ключом: устанавливайте поверх прежней игры, не удаляя её. Сохранения версий 1/2 поддерживаются.

Для редактирования распакуйте исходный ZIP, импортируйте project.godot в Godot 4.6.3 Standard и нажмите F5.

## Бесплатная таблица лидеров без VPS

Можно запустить таблицу на Cloudflare Workers + D1: нужен аккаунт Free, а адрес `https://...workers.dev` затем указывают все игроки в разделе «Лидеры». Сборку игры менять не нужно.

- [Пошаговая инструкция](https://github.com/derekpisya-a11y/skeetusers/blob/plate-club-downloads/downloads/free-leaderboard/LEADERBOARD_FREE_RU.md)
- [Скачать инструкцию TXT](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/free-leaderboard/LEADERBOARD_FREE_RU.txt)
- [Скачать код и инструкцию ZIP](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/free-leaderboard/PlateClub-Free-Leaderboard.zip)

## Свой сервер на VPS

- [Прочитать пошаговое руководство](https://github.com/derekpisya-a11y/skeetusers/blob/plate-club-downloads/downloads/v2.1/LEADERBOARD_SETUP_RU.md)
- [Скачать отдельный TXT-файл](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/LEADERBOARD_SETUP_RU.txt)
- [Скачать только сервер и инструкцию](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/PlateClub-Leaderboard-Server.zip)

Для общей таблицы владелец размещает сервис на VPS с доменом и HTTPS. Игра остаётся установленной на телефоне/ПК; Godot, EXE и APK на VPS не нужны. Все игроки вводят один HTTPS-адрес в разделе «Лидеры». Публичный сервер пока не размещён.

## Снимки

![Массовая продажа в коллекции](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/previews/collection.png)

![Подтверждение на телефоне](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/previews/bulk-sale-android.png)

Сохранены четыре темы, реальные названия моделей, сейф, задания/доллары, сложные сундуки, обвесы и разбор редких номеров. Исторические атрибуции спецсерий не подтверждены веб-исследованием и помечены в игре; подробности в PLATE_REFERENCE_RU.md исходного архива.

Проверено: логика 243/0; сервер 11/0; нативный UI 108/0 в каждом режиме с тестовым сервером; свежий исходный ZIP импортируется без ошибок исполнения. Проверены подпись прежним ключом, номер версии 2.1.0/code 4, уникальность адресов Android-компонентов, две ARM-архитектуры, портретная ориентация APK, состав и контрольные суммы архивов. Физические Android/Windows-устройства не тестировались.

[SHA256SUMS.txt](https://github.com/derekpisya-a11y/skeetusers/raw/refs/heads/plate-club-downloads/downloads/v2.1/SHA256SUMS.txt). Предыдущие файлы сохранены в downloads/v2 и downloads/PlateClub-Windows-x64.zip.
