## HRMS Lite

HRMS Lite is a small web-based HR tool that I built to manage a simple employee directory and their daily attendance.
It is intentionally narrow in scope so that the core flows stay easy to understand and test.

The project is split into two parts:
- `backend/` – FastAPI + SQLAlchemy REST API with a SQLite database
- `frontend/` – React (Vite + TypeScript) single-page app that talks to the API

### Features

- Employee management: create, list and delete employees
- Attendance tracking: mark employees as Present/Absent for a date and review their history
- Basic validation on the server (required fields, unique employee id/email, email format)
- Helpful UI states for loading, empty lists and errors
- Optional date range filter and a quick “total present days” summary per employee

### Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, TypeScript, Vite, Axios

### Running the project locally

1. **Backend**
   - Go to the backend folder:
     ```bash
     cd backend
     ```
   - Install dependencies (use your active Python, or a virtualenv if you prefer):
     ```bash
     pip install -r requirements.txt
     ```
   - Start the API on port 8000:
     ```bash
     cd ..
     python -m uvicorn backend.main:app --reload --port 8000
     ```
   - You can check that it is up by opening `http://localhost:8000/health` in the browser.

2. **Frontend**
   - In a separate terminal, move to the frontend folder:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
   - By default the app points to `http://localhost:8000`.  
     If you deploy the backend somewhere else, create a `.env` file in `frontend/` with:
     ```text
     VITE_API_BASE_URL=https://your-backend-url
     ```

### Deployment / Live URLs

- **Live application URL**: _fill in after deploying the frontend (for example, a Netlify or Vercel URL)_  
- **Backend API URL**: _fill in after deploying the FastAPI backend (for example, a Render URL like `https://your-app.onrender.com`)_

### Folder structure

- `backend/database.py` – database engine and session helpers
- `backend/models.py` – SQLAlchemy models for `Employee` and `Attendance`
- `backend/main.py` – FastAPI application and API routes
- `frontend/src/App.tsx` – top-level layout and data wiring
- `frontend/src/components` – reusable UI components (form, table, attendance panel)
- `frontend/src/services/api.ts` – Axios instance for calling the API
- `frontend/src/styles.css` – basic styling and layout

### Assumptions and notes

- The app assumes a single admin user; there is no authentication layer.
- SQLite is used for simplicity; swapping to PostgreSQL/MySQL would mainly involve updating the `DATABASE_URL` in `backend/database.py`.
- The UI is deliberately minimal: just enough styling to be readable and usable without introducing heavy UI frameworks.

