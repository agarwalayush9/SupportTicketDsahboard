# Support Ticket Dashboard

A full-stack web application for managing customer support tickets. Built with **Vue 3**, **Express**, and **SQLite**.

---

## Screenshots

| Ticket List | Ticket Detail | Create Ticket |
|:-----------:|:-------------:|:-------------:|
| ![Ticket List](screenshots/home_page.png) | ![Detail](screenshots/detail_page.png) | ![Create](screenshots/create_form.png) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 + Vue Router + Vite |
| Backend | Node.js + Express |
| Database | SQLite (via `better-sqlite3`) |
| Validation | `express-validator` (backend) + custom (frontend) |
| Testing | Jest + Supertest |

---

## Project Structure

```
SupportTicketDashboard/
├── backend/
│   ├── data/               # SQLite database files (auto-created)
│   ├── scripts/
│   │   └── seed.js         # Seed 28 demo tickets
│   ├── src/
│   │   ├── app.js          # Express app factory
│   │   ├── db/
│   │   │   ├── database.js         # DB connection (lazy singleton)
│   │   │   └── ticketRepository.js # All SQL queries
│   │   ├── middleware/
│   │   │   └── validate.js  # express-validator error handler
│   │   ├── routes/
│   │   │   └── tickets.js   # All ticket API endpoints
│   │   └── tests/
│   │       └── tickets.test.js  # 22 automated tests
│   ├── server.js           # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js          # Centralized API client
│   │   ├── utils.js        # Formatting helpers
│   │   ├── assets/
│   │   │   └── style.css   # Global design system
│   │   ├── views/
│   │   │   ├── TicketList.vue   # Home — list, search, filter
│   │   │   ├── TicketDetail.vue # View + edit ticket
│   │   │   └── CreateTicket.vue # Create form
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This inserts 28 demo tickets with varied statuses and priorities. **Re-running the seed command is safe** — it clears existing data first.

### 4. Start the Servers

**Terminal 1 — Backend API (port 3000):**
```bash
cd backend
npm start          # or: npm run dev   (uses --watch for auto-reload)
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

> The Vite dev server proxies all `/api` requests to `http://localhost:3000`, so no CORS configuration is needed.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `DB_PATH` | `backend/data/tickets.db` | Absolute path to SQLite database file. Used by tests to point to an isolated test DB. |

---

## Running Tests

```bash
cd backend
npm test
```

**22 tests** covering:
- `POST /api/tickets` — all validation rules (required fields, email format, max length, enum values, defaults)
- `GET /api/tickets` — pagination, status filter, priority filter, search by title, search by email, sort order, invalid query params
- `PATCH /api/tickets/:id` — status update, priority update, 404 for missing ticket, validation errors
- `GET /api/tickets/summary` — aggregate count shape
- `GET /api/tickets/:id` — single ticket retrieval, 404
- Unknown route — 404

Each test run creates an isolated `data/test_tickets.db` file and deletes it on completion.

---

## API Reference

### `GET /api/tickets`
List tickets with optional filtering, searching, sorting, and pagination.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search title or email (LIKE) |
| `status` | string | `Open`, `In Progress`, or `Resolved` |
| `priority` | string | `Low`, `Medium`, or `High` |
| `sort` | string | `asc` or `desc` (by `created_at`) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Per-page count (default: 10, max: 100) |

**Response:**
```json
{
  "data": [ ... ],
  "pagination": { "total": 28, "page": 1, "limit": 10, "totalPages": 3 }
}
```

### `GET /api/tickets/summary`
Returns total count and per-status breakdown (unaffected by filters).

```json
{ "total": 28, "open": 15, "in_progress": 8, "resolved": 5 }
```

### `GET /api/tickets/:id`
Returns a single ticket. `404` if not found.

### `POST /api/tickets`
Create a ticket.

**Body:**
```json
{
  "title": "Cannot log in",          // required, max 120 chars
  "description": "...",              // required
  "email": "user@example.com",       // required, valid email
  "priority": "High",               // optional, default: Medium
  "status": "Open"                   // optional, default: Open
}
```

**Returns:** `201 Created` with the created ticket.

### `PATCH /api/tickets/:id`
Update `status` and/or `priority`. At least one field is required.

**Error Response Shape (422):**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Customer email must be a valid email address." }
  ]
}
```

---

## Technical Choices & Thoughts

### Why SQLite?
I wanted to keep things simple with zero infrastructure to set up — no database server to install or configure. `better-sqlite3` is really fast and works great with Express. It felt like the perfect fit for the requirements without overcomplicating things.

### Why Vue 3 + Vite?
Vue is my go-to for building quick, reactive UIs. It's lightweight, fast, and familiar. Plus, Vite's proxy feature makes it super easy to avoid CORS headaches during local development.

### Why Express?
It's minimal, battle-tested, and just gets out of the way. It made setting up the REST API straightforward.

### Code Organization
I tried to keep the SQL stuff in its own file (`ticketRepository.js`). The routes are pretty thin and just handle the HTTP part. I figured this makes it easier to test and maintain if the app gets bigger.

### A Few Assumptions I Made
- I skipped authentication since it wasn't mentioned in the spec.
- I used a SQLite `AFTER UPDATE` trigger for the "updated timestamps" so it updates automatically no matter how the row gets modified.
- All the filtering, sorting, and pagination is handled entirely on the backend, as requested.

### Known Limitations
- There are no real-time updates right now (like WebSockets) — you'll need to refresh the page to see changes made by someone else.
- If you're on a weird OS, `better-sqlite3` might need a build step (`npm rebuild`) since it has native bindings.

---

## Time Spent

| Planning & setup | 20 min |
| Backend API & DB | 55 min |
| Tests | 25 min |
| Frontend UI & Integration | 60 min |
| Polish & Debugging | 20 min |
| **Total** | **~3 hours** |
