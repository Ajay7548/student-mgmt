# Student Management — Secure CRUD with Two-Level Encryption

A full-stack student management application featuring a Login screen and full
**Create / Read / Update / Delete** operations for student records, protected by a
**two-level AES encryption** scheme: data is encrypted in the browser, encrypted a
second time on the server, and stored double-encrypted in MongoDB.
[Live Preview](https://student-mgmt-three.vercel.app/login)
---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [How the two-level encryption works](#how-the-two-level-encryption-works)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend setup](#1-backend-setup)
  - [2. Frontend setup](#2-frontend-setup)
  - [3. Open the app](#3-open-the-app)
- [API reference](#api-reference)
- [Authentication](#authentication)
- [Security notes & production considerations](#security-notes--production-considerations)
- [Available scripts](#available-scripts)
- [Screenshots](#screenshots)

---

## Features

- 🔐 **Two-level AES encryption** — every sensitive field is encrypted in the
  browser (level 1) and again on the server (level 2) before it reaches MongoDB.
- 🧾 **Login form** with email & password validation.
- 👨‍🎓 **Student registration** with the fields: Full Name, Email, Phone Number,
  Date of Birth, Gender, Address, Course Enrolled, and Password.
- ✏️ **Full CRUD** — create, list, update, and delete students.
- ✅ **Client-side validation** with clear, per-field error messages.
- 🧱 **Clean, typed, well-commented codebase** — strict TypeScript on both ends.
- 📱 **Responsive UI** that works on desktop and mobile.

---

## Tech stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| **Frontend** | React 18, TypeScript, Vite, React Router, Axios        |
| **Backend**  | Node.js, Express, TypeScript                            |
| **Database** | MongoDB (via Mongoose ODM)                             |
| **Crypto**   | `crypto-js` (AES) on both the client and the server    |

---

## Project structure

```
student-mgmt/
├── client/                      # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormField.tsx     # Reusable labelled input/select
│   │   │   ├── LoginForm.tsx     # Login form + validation
│   │   │   ├── StudentForm.tsx   # Create/Edit student form
│   │   │   └── StudentList.tsx   # Student table with edit/delete
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts            # Shared Axios instance
│   │   │   └── studentService.ts # CRUD calls (encrypt out / decrypt in)
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Login state for the app
│   │   ├── utils/
│   │   │   ├── crypto.ts         # LEVEL-1 (client) AES encryption
│   │   │   └── validation.ts     # Form validation rules
│   │   ├── types/student.ts
│   │   ├── App.tsx               # Routes + protected route
│   │   └── main.tsx             # App entry point
│   └── ...
│
├── server/                      # Node + Express + TypeScript backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts            # Validated environment variables
│   │   │   └── db.ts             # MongoDB connection
│   │   ├── controllers/
│   │   │   └── studentController.ts
│   │   ├── middleware/
│   │   │   ├── asyncHandler.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── Student.ts        # Mongoose schema/model
│   │   ├── routes/
│   │   │   └── studentRoutes.ts
│   │   ├── utils/
│   │   │   └── crypto.ts         # LEVEL-2 (server) AES encryption
│   │   ├── app.ts               # Express app configuration
│   │   └── server.ts            # Entry point (connect DB + listen)
│   └── ...
│
└── README.md
```

---

## How the two-level encryption works

The goal is **defence in depth**: the data is wrapped in two independent AES
layers using two different secret keys. The server never sees the real plaintext,
and the database only ever stores doubly-encrypted ciphertext.

### Writing data (registering / updating a student)

```
        ┌────────────────────────── BROWSER ──────────────────────────┐
PLAINTEXT  ──(1) AES encrypt with CLIENT key──►  LEVEL-1 CIPHERTEXT
        └──────────────────────────────────────────────────┬─────────┘
                                                            │ sent over HTTP
        ┌──────────────────────────── SERVER ───────────────▼─────────┐
LEVEL-1 CIPHERTEXT  ──(2) AES encrypt with SERVER key──►  LEVEL-2 CIPHERTEXT
        └──────────────────────────────────────────────────┬─────────┘
                                                            │
                                                       ┌────▼────┐
                                                       │ MongoDB │  (double-encrypted)
                                                       └─────────┘
```

1. **Level 1 (client):** the browser encrypts each field with the *client key*
   before the data ever leaves the user's machine
   → `client/src/utils/crypto.ts`.
2. **Level 2 (server):** the backend encrypts that ciphertext **again** with a
   separate *server key* before saving it
   → `server/src/utils/crypto.ts`.

### Reading data (listing students)

The process simply runs in reverse:

```
MongoDB  ──►  LEVEL-2 CIPHERTEXT  ──(server decrypts level 2)──►  LEVEL-1 CIPHERTEXT
                                                                       │ sent to browser
BROWSER  ──(client decrypts level 1)──►  PLAINTEXT  (displayed in the UI)
```

- The **server peels off its own layer** and returns the still-encrypted level-1
  ciphertext — it never holds the plaintext.
- The **browser peels off the final layer** and renders the readable values.

> Because the data arrives at the server already encrypted, format validation
> (valid email, phone, etc.) is performed on the **client before encryption**.
> The server validates **structure** (required fields present, valid id) and owns
> the level-2 cryptography.

---

## Getting started

### Prerequisites

- **Node.js** ≥ 18 and npm
- **MongoDB** — either:
  - a local instance (`mongodb://127.0.0.1:27017`), or
  - a free **MongoDB Atlas** cluster (`mongodb+srv://...`)

### 1. Backend setup

```bash
cd server
npm install

# Create your environment file from the example and fill it in
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student-mgmt
SERVER_ENCRYPTION_KEY=<paste a long random string>
CLIENT_ORIGIN=http://localhost:5173
```

Generate a strong key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the backend:

```bash
npm run dev          # development (auto-reload)
# or
npm run build && npm start   # production build
```

The API will be available at `http://localhost:5000`.

### 2. Frontend setup

```bash
cd client
npm install

cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLIENT_ENCRYPTION_KEY=<paste a long random string (different from the server key)>
VITE_DEMO_EMAIL=admin@example.com
VITE_DEMO_PASSWORD=Admin@1234
```

Start the frontend:

```bash
npm run dev
```

### 3. Open the app

Visit **http://localhost:5173**, sign in with the demo credentials, and start
managing students.

---

## API reference

All routes are prefixed with `/api`. Request/response bodies are JSON, and every
student field value is **encrypted ciphertext** (never plaintext) on the wire.

| Method   | Endpoint             | Description            |
| -------- | -------------------- | ---------------------- |
| `POST`   | `/api/register`      | Create a new student   |
| `GET`    | `/api/students`      | Get all students       |
| `PUT`    | `/api/student/:id`   | Update a student by id |
| `DELETE` | `/api/student/:id`   | Delete a student by id |
| `GET`    | `/api/health`        | Health check           |

**Standard response envelope**

```json
{ "success": true, "message": "…", "data": { /* … */ } }
```

---

## Authentication

The task specifies a *"Login form with email & password validation"* and lists
four API routes — all for student CRUD, none for login. Accordingly, the login is
implemented as a **client-side gate**: the form validates the email/password and
checks them against demo credentials defined in `client/.env`
(`VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`). On success the user is routed to the
protected dashboard.

To turn this into production-grade authentication you would:

1. Add a `User` model and a `POST /api/auth/login` endpoint.
2. Hash passwords with **bcrypt** and compare on login.
3. Issue a **JWT** (or set an httpOnly cookie) and protect the student routes
   with an auth middleware.

---

## Security notes & production considerations

This project demonstrates a two-level encryption pattern. A few honest notes so
the design choices are clear:

- **Passwords are encrypted, not hashed.** The task requires data to be encrypted
  and decrypted for display, which is reversible by design. In a real system,
  passwords should be **hashed with bcrypt/argon2** (one-way) instead of encrypted.
- **The client key lives in the browser.** Anything shipped to the browser is
  ultimately visible to a determined user. The client layer protects data
  **in transit** and provides the outer wrapper of the scheme; the server key —
  which stays on the server — is what protects the data **at rest** in the database.
- **Keys belong in environment variables**, never in source control. The provided
  `.env.example` files document every required variable; real `.env` files are
  git-ignored.
- **Encrypted fields aren't queryable.** Because ciphertext is randomised, you
  cannot query or enforce uniqueness directly on encrypted fields. A production
  system that needs to look records up by email would store a separate
  deterministic **blind index** (e.g. an HMAC of the email) for that purpose.

---

## Available scripts

**Backend (`/server`)**

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start in watch mode (auto-reload)          |
| `npm run build`     | Compile TypeScript to `dist/`              |
| `npm start`         | Run the compiled server                    |
| `npm run typecheck` | Type-check without emitting files          |

**Frontend (`/client`)**

| Script              | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the Vite dev server                  |
| `npm run build`     | Type-check and build for production        |
| `npm run preview`   | Preview the production build locally       |
| `npm run typecheck` | Type-check without emitting files          |

---

## Screenshots

> Add screenshots of the Login page and the Dashboard here (optional).
>
> ```
> docs/login.png
> docs/dashboard.png
> ```
