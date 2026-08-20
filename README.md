# TaskFlow

A full-stack **task management** app: register, log in, then create, filter, paginate, attach files, and move tasks between statuses on a drag-and-drop board.

Built as a MERN assessment with TypeScript on both sides.

## Features

- JWT auth (register, login, session restore)
- Task CRUD with title, description, status, priority, and due date
- Search plus status/priority filters
- Paginated dashboard (6 tasks per page)
- Kanban **Board** with drag-and-drop status updates
- File attachments (Cloudinary): images, PDF, and docs — up to 10 per task, 5 MB each
- React Query caching for lists and the current user
- Dark/light theme, toasts, and form validation (Zod + React Hook Form)

## Tech stack

| Layer | Tools |
| --- | --- |
| Editor / AI | **[Cursor](https://cursor.com)** — AI-first IDE used to design, implement, and iterate on this project |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS v4, shadcn/ui, Radix UI |
| Data / forms | TanStack Query, Axios, React Hook Form, Zod, Sonner |
| Board | @dnd-kit (drag and drop) |
| Backend | Node.js, Express 5, TypeScript, Mongoose 9, Zod, JWT, Helmet, CORS |
| Database | MongoDB (Atlas or local Docker Mongo) |
| Uploads | Multer + Cloudinary |
| Package manager | Yarn |
| Dev | Concurrently, Nodemon, tsx |
| Containers | Docker, Docker Compose, Nginx |

## Project structure

```
Technical-Task/
├── backend/          Express API (TypeScript)
├── frontend/         Vite + React SPA
├── docker-compose.yml
└── package.json      Root scripts (`yarn dev` starts both apps)
```

## Prerequisites

- Node.js 22+
- Yarn 4
- MongoDB Atlas **or** Docker (for a local Mongo container)
- A Cloudinary account (attachments)
- Docker Desktop (only if you run with Compose)
- Cursor (recommended editor)

## Environment

Copy the example env file and fill in real values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | Mongo connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (`http://localhost:5173` in local dev) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Never commit `backend/.env`.

**Password rules:** at least 8 characters, one letter, and one number.

**Atlas:** allow your IP in Network Access (or `0.0.0.0/0` for a demo).

## Run locally

From the **repo root**:

```bash
yarn install
yarn dev
```

`yarn install` also installs `backend` and `frontend` dependencies.

| App | URL |
| --- | --- |
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

Vite proxies `/api` to the backend, so the browser can call `/api` on port 5173.

Start only one side:

```bash
yarn dev:frontend
yarn dev:backend
```

The API restarts on file changes with **Nodemon** + `tsx`.

## Run with Docker

1. Create `backend/.env` as above (Mongo + Cloudinary + `JWT_SECRET`).
2. From the repo root:

```bash
docker compose up --build
```

| App | URL |
| --- | --- |
| App (Nginx + SPA) | http://localhost:8080 |
| API | http://localhost:5000 |

Nginx serves the frontend and proxies `/api` to the backend.

Stop:

```bash
docker compose down
```

Add `-v` to also delete the local Mongo volume.

### Atlas (default)

Keep your `mongodb+srv://...` URI in `backend/.env`.

### Local Mongo in Docker

In `backend/.env`:

```env
MONGO_URI=mongodb://mongo:27017/taskflow
```

Then:

```bash
docker compose --profile local-db up --build
```

## Scripts

**Root**

| Script | What it does |
| --- | --- |
| `yarn dev` | Frontend + backend together |
| `yarn dev:frontend` | Vite only |
| `yarn dev:backend` | API only (Nodemon) |

**Frontend** (`frontend/`)

| Script | What it does |
| --- | --- |
| `yarn dev` | Vite dev server |
| `yarn build` | Production build |
| `yarn lint` | ESLint |

**Backend** (`backend/`)

| Script | What it does |
| --- | --- |
| `yarn dev` | Nodemon + TypeScript |
| `yarn build` | Compile to `dist/` |
| `yarn start` | Run compiled API |

## App pages

| Path | Description |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account |
| `/` | Dashboard — cards, filters, pagination |
| `/board` | Kanban — drag a card onto To Do / In Progress / Done |

## API

Base path: `/api`. Task routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register |
| `POST` | `/auth/login` | Login |
| `GET` | `/auth/me` | Current user |
| `GET` | `/tasks` | List (`search`, `status`, `priority`, `page`, `limit`) |
| `POST` | `/tasks` | Create |
| `GET` | `/tasks/:id` | Get one |
| `PUT` | `/tasks/:id` | Update |
| `DELETE` | `/tasks/:id` | Delete |
| `POST` | `/tasks/:id/attachments` | Upload files (`multipart/form-data`, field `files`) |
| `DELETE` | `/tasks/:id/attachments/:attachmentId` | Remove an attachment |

Statuses: `todo` / `To Do`, `in_progress` / `In Progress`, `done` / `Done`.  
Priorities: `low`, `medium`, `high`.

## Development notes

- Package manager is **Yarn** (not npm).
- React Query keeps list data for 30s (`staleTime`) and 5 minutes in memory (`gcTime`).
- Board drag-and-drop updates status immediately, then saves to the API.
- This project was developed in **Cursor**.
