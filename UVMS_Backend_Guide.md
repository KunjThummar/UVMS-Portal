# University Volunteer Management System (UVMS) – Backend Reference Guide

This document is the comprehensive reference guide for the updated UVMS backend. It details the architecture, directory structure, module flows, and new features like the scheduler and email notifications.

**Stack**: Node.js + Express + MongoDB (Mongoose)

---

## 1. Architectural Overview

The backend uses a standard Node.js/Express MVC-like architecture but is organized by **Feature Modules** (e.g., Auth, Events, Applications). 

### Request Flow
The typical lifecycle of a request follows this path:
`Route (Express) -> Validation (Joi Middleware) -> Controller -> Service -> Mongoose Model -> MongoDB`

### Design Decision: No Repository Layer
Unlike raw-SQL projects where a repository layer abstracts complex SQL queries, this project intentionally skips the repository layer. Mongoose models (`Student.find()`, `Event.findById()`, etc.) already act as a robust abstraction over the database. Services interact directly with Mongoose Models to keep the architecture clean and avoid redundant boilerplate.

---

## 2. Project Directory Structure

```
backend/
├── src/
│   ├── app.js               # Express app configuration & global middleware
│   ├── server.js            # Server entry point (starts Express and connects DB)
│   ├── config/              # Database connection and environment variables
│   ├── middleware/          # Shared middlewares (Auth, Validation, Error Handling)
│   ├── models/              # Mongoose database schemas
│   ├── utils/               # Reusable utilities (ApiError, ApiResponse)
│   │
│   ├── applications/        # Feature: Volunteer Applications
│   ├── auth/                # Feature: Authentication & Registration
│   ├── cleanup/             # Feature: Old Event Cleanup service
│   ├── departments/         # Feature: Department Management
│   ├── events/              # Feature: Event Management (Faculty & Admin)
│   ├── faculty/             # Feature: Faculty Management
│   ├── institutes/          # Feature: Institute Management
│   ├── notifications/       # Feature: Email Notifications
│   ├── scheduler/           # Feature: Cron Jobs for Sweeps & Cleanup
│   └── students/            # Feature: Student Management
```

---

## 3. Role & Authentication System

### Collections
The database relies on three separate user collections instead of a unified "User" collection with role flags. This simplifies querying and avoids empty optional fields.
- **Student**: Contains `semester`, `studentId`. Registers via API.
- **Faculty**: Belongs to Institute & Department. Registers via API.
- **Administrator**: Seeded via a CLI script. No public registration route.

### Authentication
Authentication uses **JWT (JSON Web Tokens)**.
- `generateToken.js` creates a token embedding the user's `_id` and `role`.
- `authenticate.js` middleware validates the token, fetching the user profile from the respective collection based on the `role` in the JWT payload.
- `authorize(...roles)` middleware ensures only specific roles (e.g., `["faculty", "admin"]`) can access certain endpoints.

---

## 4. Module Breakdown

### A. Auth Module (`src/auth/`)
Handles registration and login.
- **Routes**:
  - `POST /api/auth/student/register` -> `registerStudent()`
  - `POST /api/auth/faculty/register` -> `registerFaculty()`
  - `POST /api/auth/student/login` -> `loginStudent()`
  - `POST /api/auth/faculty/login` -> `loginFaculty()`
  - `POST /api/auth/admin/login` -> `loginAdmin()`
  - `GET /api/auth/me` -> `getCurrentUser()` (Requires Auth)
- **Validation**: Uses Joi to ensure Charusat domain emails (`@charusat.edu.in` / `@charusat.ac.in`).
- **Service**: Hashes passwords with `bcrypt`, ensures emails/student IDs are unique, generates JWTs.

### B. Institutes & Departments Modules (`src/institutes/` & `src/departments/`)
Manages university structure.
- **Institute**: `name`, `code` (e.g., "IT").
- **Department**: `name`, `code`, `instituteId` (e.g., "CSE" inside "IT").
- Both modules feature standard CRUD operations (Create, Get All, Get By Id, Update, Delete) restricted mainly to Admins.

### C. Events Module (`src/events/`)
The core functionality for faculty to create opportunities and admins to manage them.
- **Faculty Routes (`src/events/faculty.routes.js`)**: Create, update, delete own events.
- **Admin Routes (`src/events/admin.routes.js`)**: Oversee all events, archive events.
- **Service Logic**: 
  - `createEvent`: Handles event creation and triggers `notifyEligibleStudents` from the Notifications module.
  - `checkAndCloseIfFull`: Automatically transitions Event status from 'Open' to 'ApplicationClosed' when `approvedCount` reaches `volunteerCapacity`.
  - `checkAndCloseIfDeadlinePassed`: Transitions event if the application deadline has passed.

### D. Applications Module (`src/applications/`)
Handles students applying to events and faculty making decisions.
- **Routes**:
  - `POST /api/applications/:eventId/apply` -> Student applies.
  - `PUT /api/applications/:applicationId/decision` -> Faculty approves/rejects.
  - `GET /api/applications/student/me` -> Student views own applications.
  - `GET /api/applications/event/:eventId` -> Faculty views event's applicants.
- **Service Logic**:
  - `applyToEvent`: Enforces eligibility based on event level (University, Institute, or Department), checks if the deadline has passed, and ensures the student hasn't already applied.
  - `approveApplication`: Uses MongoDB `$expr` and `$inc` for atomic capacity checks, preventing race conditions where two rapid approvals exceed `volunteerCapacity`. Automatically closes event if full.
  - `rejectApplication`: Sets status to Rejected.

### E. Scheduler & Cleanup Module (`src/scheduler/` & `src/cleanup/`)
Automated background tasks using `node-cron`.
- **`deadlineSweep.job.js` (Runs every 15 mins)**: Scans for events where `status == 'Open'` and `applicationDeadline < now`, automatically closing them.
- **`autoCleanup.job.js` (Runs daily at midnight)**: Finds `Completed` events older than 1 year (that are not flagged as `isArchived`), and permanently deletes them along with all their associated Volunteer Applications to save database space.

### F. Notifications Module (`src/notifications/`)
Handles outbound communications.
- **`email.service.js`**: Uses `nodemailer` to send emails.
- **`notifyEligibleStudents(event)`**: Looks at `eventLevel` (University, Institute, Department) and fetches eligible students to send a BCC email alerting them of the new opportunity.

---

## 5. Middleware & Error Handling

- **`validate(schema)`**: Intercepts requests. If `req.body` doesn't match the Joi schema, it immediately returns a `400 Bad Request` without hitting the controller.
- **`asyncHandler(fn)`**: Wraps controller functions in a try/catch block, forwarding any errors to the global error handler, eliminating repetitive try/catch boilerplate.
- **`ApiError` class**: A custom Error class containing a status code and message. Used heavily in Services (e.g., `throw new ApiError(404, 'Event not found')`).
- **`errorHandler` middleware**: The final safety net that formats errors and sends a consistent JSON response (`{ success: false, error: "message" }`) back to the client.

---

## 6. Development & Scripts

- **Starting the server**: `npm run dev` (uses nodemon) or `npm start`.
- **Environment Variables**: `.env` requires configuration for MongoDB URI, JWT Secret, and SMTP credentials (for Nodemailer).
- **Default Admin**: `src/utils/createDefaultAdmin.js` can be executed standalone to seed the initial platform administrator.
