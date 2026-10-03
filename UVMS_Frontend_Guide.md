# University Volunteer Management System (UVMS) – Frontend Reference Guide

This document is the comprehensive reference guide for the React (Vite) frontend. It outlines the architecture, the directory structure, how components talk to the backend, and highlights important corrections needed to properly align with the new backend.

**Stack**: React (Vite) + Plain CSS + Axios + React Router

---

## 1. Architectural Overview

There is no separate "controller" or "model" layer on the frontend. Instead, the frontend is organized into:

- **`pages/`**: One file per route/screen (composes child components).
- **`components/`**: Reusable pieces (forms, cards, tables, buttons).
- **`services/`**: Holds all Axios calls. Should mirror the backend's module boundaries.
- **`context/`**: Global state (e.g., AuthContext, ToastContext).
- **`routes/`**: Handles navigation and protected route guards.

### Request Flow
`Page.jsx -> (Child Components) -> service.js (axios call) -> API Backend`
Upon receiving data, the components update local or global context state and trigger a re-render.

---

## 2. Directory Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Global app configuration (wrappers, contexts)
│   ├── main.jsx                # React DOM entry point
│   ├── components/             # Reusable UI elements
│   ├── context/                # Global React contexts (Auth, Toast)
│   ├── pages/                  # Page-level components
│   │   ├── admin/
│   │   ├── faculty/
│   │   ├── public/
│   │   └── student/
│   ├── routes/                 # Routing logic
│   │   ├── AppRoutes.jsx       # The main router Switch/Routes block
│   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   └── Router.jsx          # BrowserRouter wrapper
│   └── services/               # API call wrappers
│       ├── api.js              # Base Axios instance and interceptors
│       ├── application.service.js
│       ├── auth.service.js
│       ├── department.service.js
│       ├── event.service.js
│       └── institute.service.js
```

---

## 3. The Route Map (`AppRoutes.jsx`)

The routing relies on `<ProtectedRoute allowedRoles={['...']}>` to restrict access.

### Public Routes
- `/` - Landing Page
- `/login`, `/login/student`, `/login/faculty`, `/login/admin` - Login pages
- `/register`, `/register/student` - Student registration
- `/register-faculty` - Faculty registration

### Student Routes
- `/student/dashboard`
- `/student/events` - Browse eligible events
- `/student/events/:id` - View event details
- `/student/applications` - View applied events
- `/student/profile`

### Faculty Routes
- `/faculty/dashboard`
- `/faculty/events` - Manage created events
- `/faculty/events/create` - Create new event
- `/faculty/events/:id/edit` - Edit event
- `/faculty/events/:id/applications` - View applicants for an event
- `/faculty/profile`

### Admin Routes
- `/admin/dashboard`
- `/admin/events` - Oversee all events
- `/admin/applications` - Oversee all applications
- `/admin/students`
- `/admin/faculty`
- `/admin/institutes`
- `/admin/departments`

*(Note: There are several legacy routes in `AppRoutes.jsx` like `/admin/categories`, `/faculty/opportunities/create/project`, etc., which are no longer supported by the backend and should be safely removed.)*

---

## 4. Frontend Services to Backend API Map

This section maps the frontend service calls to the actual backend API endpoints. **Any mismatches currently in the codebase must be corrected to match this table.**

| Service File                 | Action                               | Frontend Axios Call Should Be...                        | Matching Backend Route                            |
|------------------------------|--------------------------------------|---------------------------------------------------------|---------------------------------------------------|
| **`auth.service.js`**        | Student Login                        | `POST /auth/student/login`                              | `POST /api/auth/student/login`                    |
|                              | Faculty Login                        | `POST /auth/faculty/login`                              | `POST /api/auth/faculty/login`                    |
|                              | Admin Login                          | `POST /auth/admin/login`                                | `POST /api/auth/admin/login`                      |
|                              | Register Student                     | `POST /auth/student/register`                           | `POST /api/auth/student/register`                 |
|                              | Register Faculty                     | `POST /auth/faculty/register`                           | `POST /api/auth/faculty/register`                 |
| **`institute.service.js`**   | List Institutes                      | `GET /institutes`                                       | `GET /api/institutes`                             |
| **`department.service.js`**  | List Departments                     | `GET /departments?instituteId=...`                      | `GET /api/departments`                            |
| **`event.service.js`**       | Student List Eligible Events         | `GET /student/events`                                   | `GET /api/student/events`                         |
|                              | Student Get Event Details            | `GET /student/events/:id`                               | `GET /api/student/events/:id`                     |
|                              | Faculty Create Event                 | `POST /faculty/events`                                  | `POST /api/faculty/events`                        |
|                              | Faculty Get Own Events               | `GET /faculty/events`                                   | `GET /api/faculty/events`                         |
|                              | Admin Get All Events                 | `GET /admin/events`                                     | `GET /api/admin/events`                           |
|                              | **(NEW) Archive Event**              | `PATCH /faculty/events/:id/archive`                     | `PATCH /api/faculty/events/:id/archive`           |
| **`application.service.js`** | Student Apply to Event               | `POST /student/events/:id/apply`                        | `POST /api/student/events/:id/apply`              |
|                              | Student View Own Applications        | `GET /student/applications`                             | `GET /api/student/applications`                   |
|                              | Faculty View Applications for Event  | **`GET /applications/event/:eventId`**                  | `GET /api/applications/event/:eventId`            |
|                              | Faculty Approve Application          | **`PATCH /applications/:id/approve`**                   | `PATCH /api/applications/:id/approve`             |
|                              | Faculty Reject Application           | **`PATCH /applications/:id/reject`**                    | `PATCH /api/applications/:id/reject`              |
|                              | Admin View All Applications          | **`GET /applications`**                                 | `GET /api/applications`                           |

---

## 5. Required Corrections and Missing Features

The frontend codebase requires some cleanup to accurately reflect the current, robust backend.

### 1. Fix Endpoint Mismatches in `application.service.js`
The `application.service.js` file is currently calling `/faculty/events/:eventId/applications` and `/faculty/applications/:applicationId/approve`. **These are wrong.** 
As shown in the table above, the backend handles applications at the root level `/api/applications`. You must update the Axios calls to match the backend.

### 2. Implement "Archive Event"
The backend includes a feature (`isArchived` flag) to prevent old events from being deleted by the automated scheduler. The frontend should add an "Archive" button in the Faculty and Admin event management views to call `PATCH /faculty/events/:id/archive` or `PATCH /admin/events/:id/archive`.

### 3. Implement Email Notifications
The backend includes a `notifyEligibleStudents` feature. When a faculty member creates an event, the backend automatically handles sending an email to eligible students based on the event's target level (University/Institute/Department). Ensure the frontend displays a success toast mentioning that students have been notified upon event creation.

### 4. Delete "Ghost" Services
The following services are obsolete and do not map to the current backend architecture. Delete these files to avoid confusion:
- `fileService.js`
- `categoryService.js`
- `communicationService.js`
- `adminService.js` (Merge necessary calls into the relevant feature service, e.g., `event.service.js`)
