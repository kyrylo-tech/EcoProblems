# Eco Guard (EcoProblems)

Карта пунктів прийому вторсировини та екологічних проблем України.

```
EcoProblems/
├── ecoproblems.db   # SQLite (створюється автоматично, в git не потрапляє)
├── uploads/         # фото точок (в git не потрапляє)
├── backend/         # FastAPI + SQLAlchemy 2 + Alembic
└── frontend/        # Next.js 16 + Untitled UI
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                 # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
python -m app.cli seed                 # демо-точки (необов'язково)
python -m app.cli create-admin --email admin@example.com --password <пароль>
uvicorn app.main:app --reload --port 8000
pytest                                 # тести
```

Swagger: http://localhost:8000/docs. Налаштування — `backend/.env` (див. `.env.example`; у проді обов'язково `SECRET_KEY`).

### Моделі

- **User** — ім'я, прізвище, пошта (унікальна, в нижньому регістрі), хеш пароля (argon2), роль `user` / `admin`.
- **Point** — `type`: `eco_problem` | `collection`; назва, опис, `latitude`/`longitude`, місто й вулиця (якщо не передані — визначаються за координатами через OpenStreetMap Nominatim).
  - екопроблема: `problem_kind` (10 видів, див. `/api/catalog`);
  - пункт прийому: `accepted_waste` (пластик, скло, папір, метал, батарейки, текстиль — з описом «приймають / не приймають» у довіднику) і `schedule` (по днях тижня, `null` — без обмежень);
  - модерація: `pending` → `approved` / `rejected` (з причиною); адмін може приховати (`is_hidden`). Точки адміна схвалюються одразу; редагування автором повертає точку на модерацію.
  - фото: JPEG/PNG/WebP, до 10 МБ, до 10 на точку.
- **Comment** — публікується одразу, адмін може приховати; видалити — автор або адмін.

Усі тексти (довідники, помилки, валідація) — українською. Значення enum'ів в API — англійські коди, підписи — у `GET /api/catalog`.

### API

| Метод | Шлях | Хто |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | всі |
| GET | `/api/auth/me` | авторизований |
| GET | `/api/catalog`, `/api/stats`, `/api/geo/reverse?lat&lng` | всі |
| GET | `/api/points` — фільтри `type`, `problem_kind`, `waste`, `q`, `city`, bbox, `near_lat/near_lng` | всі |
| GET | `/api/points/{id}`, `/api/points/{id}/comments` | всі (неопубліковані — автор/адмін) |
| GET | `/api/points/mine` | авторизований |
| POST / PATCH / DELETE | `/api/points`, `/api/points/{id}` | авторизований / автор, адмін |
| POST / DELETE | `/api/points/{id}/photos`, `/api/points/{id}/photos/{photo_id}` | автор, адмін |
| POST | `/api/points/{id}/comments` | авторизований |
| DELETE | `/api/comments/{id}` | автор, адмін |
| GET | `/api/admin/points`, `/api/admin/comments`, `/api/admin/users` | адмін |
| POST | `/api/admin/points/{id}/approve` · `reject` · `hide` · `unhide` | адмін |
| POST | `/api/admin/comments/{id}/hide` · `unhide` | адмін |
| PATCH | `/api/admin/users/{id}` (роль) | адмін |

Авторизація — `Authorization: Bearer <access_token>`.

### Нова модель / міграція

1. Модель у `backend/app/models/`, імпорт у `backend/app/models/__init__.py`.
2. `alembic revision --autogenerate -m "..."` → `alembic upgrade head`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000. Запити на `/api/*` Next проксує на бекенд (`BACKEND_URL`, за замовчуванням `http://localhost:8000`), Server Components ходять на бекенд напряму (`src/lib/server-api.ts`).

- UI — лише [Untitled UI](https://www.untitledui.com/react) (PRO-ліцензія з `~/.untitledui/config.json`): нові компоненти — `npx untitledui@latest add <component>`, пошук — `npx untitledui@latest search "<запит>"`.
- Тема — стандартна Untitled UI з зеленим brand (`src/styles/theme.css`), світла й темна.
- Лейаут: `marketing/header-navigation/header.tsx` (Header) і `marketing/footers/footer-large-02.tsx`.
- Головна (`src/components/home`) зібрана з секцій Untitled UI: `hero-split-image-01` (замість картинки — карта пунктів), `metrics-card-gray-light`, `features-icon-cards-01/02`, `progress-steps`, `cta-card-horizontal-brand`.

### Авторизація

- Сторінки `/login` і `/register` (`src/components/auth`, за макетом Untitled UI `log-in-simple` / `sign-up-simple`). Параметр `?next=/шлях` — куди повернути після входу.
- Server Actions (`src/lib/auth-actions.ts`) викликають `/api/auth/login` і `/api/auth/register` та кладуть JWT у httpOnly-cookie `eg_session` (без «Запам'ятати мене» — до закриття браузера). Вихід — видалення cookie.
- Server Components: `getCurrentUser()` з `src/lib/current-user.ts` (root layout передає користувача в Header).
- Клієнтські запити `api()` на `/api/*`: `src/proxy.ts` перетворює cookie на `Authorization: Bearer`, тож токен у JS не потрапляє.
