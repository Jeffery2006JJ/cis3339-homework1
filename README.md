# CIS 3339 Homework 1 – Student Management System (Vue 3 + Express + MongoDB)

A full-stack student management application. It replaces the starter HTML/JavaScript pages
and the `students.json` file with:

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, built with Vite
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB Community Edition (local) through Mongoose

Features:

| Area        | What you can do |
|-------------|-----------------|
| Students    | Add (name, student ID, phone, ZIP), search by name or ID, view all, delete |
| Courses     | Add (course ID, course name), list, delete |
| Enrollments | Enroll an existing student in an existing course, list the students in a course, remove an enrollment |

Data rules: required-field validation on client and server, no duplicate student IDs,
course IDs, or enrollments; enrollments may only reference existing students and courses;
deleting a student or a course also deletes its enrollments.

---

## Required software

| Software | Version |
|----------|---------|
| [Node.js](https://nodejs.org/) (includes npm) | 18.18 or newer (20 LTS or 22 LTS recommended) |
| [MongoDB Community Edition](https://www.mongodb.com/try/download/community) | 6.0 or newer, running locally on port 27017 |
| A modern web browser | Chrome, Edge, Firefox, or Safari |

## Environment variables

The real `.env` file is committed in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Local MongoDB connection string. The `cis3339_homework1` database does **not** need to exist. |
| `PORT` | Port for the Express server (default `3000`). |

No passwords, cloud services, or MongoDB Atlas are used.

## Start MongoDB Community Edition

MongoDB must be running before you start the app.

- **Windows:** MongoDB is usually installed as a service and starts automatically.
  To start it manually, open **Services** and start **MongoDB Server**, or run
  `net start MongoDB` in an Administrator command prompt.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux (systemd):** `sudo systemctl start mongod`
- **Any OS (manual):** `mongod --dbpath <path-to-an-existing-data-folder>`

You do **not** need to create the database, collections, or indexes. When the server starts it
connects to MongoDB and automatically creates the `students`, `courses`, and `enrollments`
collections and their unique indexes. There is no seed, migration, or import step.

## Install, build, and run (production)

Run these commands in the project root (the folder that contains `package.json`):

```bash
npm install
npm run build
npm start
```

Then open **http://localhost:3000** in your browser.

- `npm install` installs the frontend and backend dependencies (single root `package.json`).
- `npm run build` compiles the Vue app into `dist/` with Vite.
- `npm start` runs `node backend/server.js`, which serves the REST API under `/api` and the
  built Vue app from `dist/`. Refreshing any page (for example `http://localhost:3000/courses`)
  works because the server returns `index.html` for client-side routes.

Stop the server with `Ctrl + C`. Data stays in MongoDB, so it is still there after a restart.

## Development mode (optional)

Use two terminals for hot reload:

```bash
npm run dev:server   # Express API on http://localhost:3000 (restarts on changes)
npm run dev          # Vite dev server on http://localhost:5173 (proxies /api to port 3000)
```

---

## Project structure

```
.
├── .env                      # Local MongoDB settings (committed on purpose)
├── package.json              # Scripts and dependencies for the whole project
├── vite.config.js            # Vite config: source in frontend/, output in dist/
├── backend/
│   ├── server.js             # Express app: API routes + serves dist/ + SPA fallback
│   ├── db.js                 # MongoDB connection and automatic collection/index creation
│   ├── models/               # Mongoose schemas: Student, Course, Enrollment
│   ├── routes/               # REST endpoints: students, courses, enrollments
│   └── utils/errors.js       # Validation helpers and JSON error handler
└── frontend/
    ├── index.html
    ├── public/favicon.svg
    └── src/
        ├── main.js           # Creates the app, installs Pinia and Vue Router
        ├── App.vue           # Layout: header, <RouterView>, toasts, confirm dialog
        ├── api/http.js       # fetch() wrapper for the REST API
        ├── router/index.js   # Routes: /, /courses, /enrollments, 404 page
        ├── stores/           # Pinia stores: students, courses, enrollments, notifications, confirm
        ├── components/       # Reusable components (forms, tables, fields, status, dialogs)
        ├── views/            # StudentsView, CoursesView, EnrollmentsView, NotFoundView
        ├── utils/validators.js
        └── assets/main.css
```

## REST API

All responses are JSON. Errors look like `{ "error": "message" }`.

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| GET | `/api/health` | Server and database status | 200 | |
| GET | `/api/students?search=text` | All students, or those whose name contains `text` or whose ID equals `text` | 200 | 503 |
| GET | `/api/students/:studentId` | One student | 200 | 404 |
| POST | `/api/students` | Body `{ name, studentId, phone, zip }` | 201 | 400, 409 duplicate ID |
| DELETE | `/api/students/:studentId` | Deletes the student **and their enrollments** | 200 | 404 |
| GET | `/api/courses` | All courses | 200 | 503 |
| POST | `/api/courses` | Body `{ courseId, name }` | 201 | 400, 409 duplicate ID |
| DELETE | `/api/courses/:courseId` | Deletes the course **and its enrollments** | 200 | 404 |
| GET | `/api/enrollments?courseId=CIS%203339` | Course roster: `{ course, students }` | 200 | 400, 404 |
| POST | `/api/enrollments` | Body `{ studentId, courseId }` | 201 | 400, 404 unknown student/course, 409 duplicate |
| DELETE | `/api/enrollments/:id` | Removes a single enrollment | 200 | 400, 404 |

If MongoDB is unreachable, API calls return **503** with a clear message. If MongoDB is not
running at startup, the server prints instructions and exits.

## Data model (MongoDB)

- **students**: `name`, `studentId` (unique, digits), `phone`, `zip` (5-digit or ZIP+4), timestamps
- **courses**: `courseId` (unique, stored in upper case, e.g. `CIS 3339`), `name`, timestamps
- **enrollments**: `student` (ObjectId → students), `course` (ObjectId → courses), timestamps;
  unique compound index on `{ student, course }`

## Quick test checklist

1. Students page: add John (1001, 555-1234, 77001) and Jane (1002, 555-5678, 77002).
   Search "John". Try adding ID 1001 again (rejected). Delete John.
2. Courses page: add `CIS 3339` Enterprise Applications Development and `CIS 3368`
   Advanced Object-Oriented Programming. Try adding `CIS 3339` again (rejected).
3. Enrollments page: enroll a student in a course, try the same enrollment again (rejected),
   enroll another student, then choose the course and select **List Students**.
4. Delete a student or course and confirm its enrollments disappear from the roster.
5. Stop the server (`Ctrl + C`), run `npm start` again, refresh the page, and confirm the data is still there.
