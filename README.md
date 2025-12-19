# Todo List AI — Backend + Instructions

This repository contains the frontend (HTML/CSS/JS) and a simple Node.js + Express backend with SQLite to persist users and tasks.

Overview
- Frontend: index.html, style.css, script.js (original). A backend-enabled frontend version is available as `script.backend.js`.
- Backend: `server.js` and `db.js`. Uses SQLite (`data.db`) to store users and tasks.

Prerequisites
- Node.js (v14+ recommended) installed on your machine.
- Optional: `npm` or `yarn` for installing dependencies.

Quick start (development)
1. Open a terminal in this project folder (the folder that contains `package.json`).

2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

Serving the frontend
- For the browser to allow `fetch` requests to the backend, serve the frontend files over HTTP (not `file://`). You can use a simple static server, for example:

```bash
# If you have Python 3 installed
python -m http.server 5500
# then open http://localhost:5500 in your browser
```

- Alternatively use VS Code Live Server extension or any static file server.

Using the backend-enabled frontend
- Replace the original `script.js` in `index.html` with `script.backend.js` (or just open `index.html` after ensuring it references `script.backend.js`). The backend-enabled script will call the API endpoints for register/login and task CRUD.

API Endpoints
- POST /api/register  { email, password }
- POST /api/login     { email, password } -> returns { token, email }
- GET  /api/tasks     (Authorization: Bearer <token>)
- POST /api/tasks     { title, deadline } (Authorization)
- PUT  /api/tasks/:id { title, deadline, completed } (Authorization)
- DELETE /api/tasks/:id (Authorization)
- POST /api/nlp       { text } -> simple mocked NLP parser (Authorization)

Security notes (for beginners)
- Passwords are hashed with `bcrypt` before storing.
- Authentication is done via JSON Web Tokens (JWT). For production, set a strong `JWT_SECRET` environment variable.
- `data.db` is created in the project root. Do not commit it to source control (it's included in `.gitignore`).

How to test
1. Start the backend (`npm start`).
2. Serve the frontend via a static server and open it in the browser.
3. Create a user via the Register form.
4. Login with that user — the app will call the backend and store a token in `localStorage`.
5. Add / edit / delete tasks — they persist in `data.db`.


