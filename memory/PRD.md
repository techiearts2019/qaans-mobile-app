# Dihadi — Face Attendance App

## Overview
Dihadi is a mobile-first face attendance app for supervisors. Employees are enrolled with a photo, allocated to projects, and their check-in / check-out is captured via face recognition. Attendance, salary and notifications live in a MySQL/MariaDB database and are served to the Expo mobile app through a FastAPI backend.

## Architecture
```
Expo mobile app  ──HTTPS──▶  /api/*  (FastAPI, SQLAlchemy)  ──▶  MySQL / MariaDB (external)
```
- Mobile never touches MySQL directly.
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB` live only in `/app/backend/.env`.
- SQLAlchemy connects with the `mysql+pymysql` driver.
- Tables auto-create on startup and idempotent seed loads demo data if empty.

## Backend endpoints (all under `/api`)
- `GET /supervisor/me`
- `GET /employees` (`?status=&q=`), `POST /employees`, `GET /employees/{id}`, `DELETE /employees/{id}`
- `GET /projects` (`?status=&q=`), `POST /projects`, `GET /projects/{id}`
- `POST /projects/{project_id}/allocate/{employee_id}`, `DELETE /projects/{project_id}/allocate/{employee_id}`
- `GET /attendance/today`, `POST /attendance/mark`
- `GET /salary?month=Feb 26`
- `GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/read-all`

Auth is intentionally OFF for the current demo.

## Screens & Flow
1. Splash → Welcome → Login (email + OTP or "Continue as Demo Supervisor") → Tabs
2. Bottom tabs: **Home · Attendance (center scan button) · Notifications · Profile**
3. Deep routes: `/employees`, `/employees/add`, `/projects`, `/projects/[id]`, `/attendance-records`, `/salary-records`
4. Face Attendance uses live camera + simulated match every ~4s and **`POST /api/attendance/mark`** on each match. Speech (Hindi) announces the matched name.
5. All list screens use `useFocusEffect` + `useEffect` for initial + pull-to-refresh reloads from the API.

## Frontend data layer
- `/app/frontend/src/lib/api.ts` — typed `fetch` client with `Employee`, `Project`, `AttendanceEntry`, `SalaryRow`, `AppNotification`, `Supervisor` types.
- `EXPO_PUBLIC_BACKEND_URL` from `frontend/.env` (never modified).
- Mock data file (`mockData.ts`) is kept only for enum lists (designations, skills, genders, marital statuses).

## Design System
Slate-900 primary, Blue-600 brand, Emerald-600 success. Radius 12/16/20/28. 8pt grid. Custom Dihadi monogram logo bundled as image asset.

## Dependencies
- Backend: `fastapi`, `uvicorn`, `sqlalchemy`, `pymysql`, `cryptography`, `python-dotenv`.
- Frontend: `expo-camera`, `expo-speech`, `expo-image`, `expo-linear-gradient`, `react-native-keyboard-controller`, `react-native-safe-area-context`, `@expo/vector-icons`.
