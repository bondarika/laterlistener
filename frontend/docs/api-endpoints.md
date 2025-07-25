## Аутентификация и пользователь

- **POST `/auth/register`**
  - Регистрирует пользователя через Telegram (ожидает `{ telegram_id: ... }` в теле запроса).
- **GET `/auth/login`**
  - Возвращает текущего авторизованного пользователя (проверка сессии).
- **POST `/auth/logout`**
  - Логаут (убирает токен из cookie).

---

## Транскрипции

- **GET `/api/transcripts`**
  - Возвращает список всех транскрипций пользователя (используется на дашборде/в истории).
- **GET `/api/transcripts/:id`**
  - Возвращает одну транскрипцию по ID (используется для просмотра и шаринга).
- **PUT `/api/transcripts/:id`**
  - Обновляет транскрипцию (например, после редактирования текста или спикера).
- **GET `/api/transcripts/:id/summary`**
  - Возвращает краткое содержание транскрипции (используется для вкладки "Саммари").
- **GET `/api/transcripts/:id/download?format=txt`** **может быть будет чисто на фронте**
  - Скачивает расшифровку в формате TXT. 
- **GET `/api/transcripts/:id/download?format=pdf`** **может быть будет чисто на фронте**
  - Скачивает расшифровку в формате PDF.

---

## Загрузка аудио **??? нужно ли вообще вне тг бота ???**

- **POST `/api/upload`**
  - Загружает аудиофайл для транскрибирования (см. комментарии в `AudioUpload.tsx`).

---

## Настройки ???

- **пока не трогаем**.

---

## Сводная таблица

| Эндпоинт                                   | Метод | Назначение                            |
| ------------------------------------------ | ----- | ------------------------------------- |
| `/auth/register`                           | POST  | Регистрация/логин через Telegram      |
| `/auth/login`                              | GET   | Получить текущего пользователя/сессию |
| `/auth/logout`                             | POST  | Выйти из системы                      |
| `/api/transcripts`                         | GET   | Получить список всех транскрипций     |
| `/api/transcripts/:id`                     | GET   | Получить одну транскрипцию            |
| `/api/transcripts/:id`                     | PUT   | Обновить транскрипцию                 |
| `/api/transcripts/:id/summary`             | GET   | Получить саммари для транскрипции     |
| `/api/transcripts/:id/download?format=txt` | GET   | Скачать транскрипцию в формате TXT    |
| `/api/transcripts/:id/download?format=pdf` | GET   | Скачать транскрипцию в формате PDF    |
| `/api/upload`                              | POST  | Загрузить аудиофайл для транскрипции  |

---
