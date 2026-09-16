================================================================
UNIVERSITY VOLUNTEER MANAGEMENT SYSTEM (UVMS) — FRONTEND FILE REFERENCE GUIDE
For: Solo Student Project | Stack: React (Create React App / Vite) + Plain CSS
Talks to: The UVMS backend described in New_UVMS_Backend_File_Reference_Guide.txt
================================================================

HOW TO READ THIS DOCUMENT
--------------------------
Every module has multiple files.
For each file you will see:
  - What the file does
  - What components / functions it holds
  - What each one does
  - Which backend endpoint(s) it talks to (from the backend guide)

The flow is always:
  page.jsx --> (child components) --> service.js (axios call) --> backend API
                     |
                     v
              context / local state --> re-render

NOTE ON ARCHITECTURE:
  There is no separate "controller" or "model" layer on the frontend —
  those concepts only exist server-side. Instead, the frontend has:
    pages/      -->  one file per route/screen, composes components
    components/ -->  reusable pieces (forms, cards, tables, buttons)
    services/   -->  one file per backend module, holds every axios
                     call for that module (mirrors the backend's
                     module boundaries: auth, events, applications...)
    context/    -->  global state that many components need
                     (who is logged in, their role, their token)
    routes/     -->  guards that decide who is allowed to see a page
    utils/      -->  small helpers (date formatting, constants)

  Each service.js file is the frontend's mirror of the backend's
  routes.js file — same endpoints, same shape, just calling out
  instead of receiving.

================================================================
MODULE 0: PROJECT SETUP & GLOBAL FILES
================================================================

----------------------------------------------------------------
FILE: src/main.jsx  (or src/index.js)
----------------------------------------------------------------
What it does:
  The actual entry point. Mounts the React app into index.html,
  wraps everything in the providers every page needs.

What it does in order:
  1. Creates the React root
  2. Wraps <App /> in <BrowserRouter>
  3. Wraps that in <AuthProvider> (see Module 1)
  4. Renders to the DOM

----------------------------------------------------------------
FILE: src/App.jsx
----------------------------------------------------------------
What it does:
  Defines every route in the app and which component/page renders
  for each URL. This is the frontend's equivalent of app.js mounting
  route modules on the backend.

What it holds:
  <Routes> containing:
    Public routes:
      /                          --> LandingPage
      /login/student             --> StudentLoginPage
      /register/student          --> StudentRegisterPage
      /login/faculty             --> FacultyLoginPage
      /login/admin               --> AdminLoginPage
      (NOTE: no /register/faculty route is linked anywhere in nav —
      matches the backend's deliberate decision to keep that endpoint
      unlisted. If you ever need it, hit the API directly or add a
      hidden route.)

    Protected — Student only (wrapped in <ProtectedRoute role="student">):
      /student/dashboard          --> StudentDashboardPage
      /student/events             --> StudentEventListPage
      /student/events/:id         --> StudentEventDetailsPage
      /student/applications       --> MyApplicationsPage

    Protected — Faculty only (wrapped in <ProtectedRoute role="faculty">):
      /faculty/dashboard           --> FacultyDashboardPage
      /faculty/events              --> FacultyEventListPage
      /faculty/events/new          --> FacultyEventFormPage (create mode)
      /faculty/events/:id          --> FacultyEventDetailsPage
      /faculty/events/:id/edit     --> FacultyEventFormPage (edit mode)
      /faculty/events/:id/applications --> FacultyApplicationsPage

    Protected — Admin only (wrapped in <ProtectedRoute role="admin">):
      /admin/dashboard              --> AdminDashboardPage
      /admin/events                 --> AdminEventListPage
      /admin/events/:id             --> AdminEventDetailsPage
      /admin/applications           --> AdminApplicationsPage
      /admin/institutes             --> AdminInstitutesPage
      /admin/departments            --> AdminDepartmentsPage

    Fallback:
      *                            --> NotFoundPage

----------------------------------------------------------------
FILE: src/api/axiosInstance.js
----------------------------------------------------------------
What it does:
  One shared axios instance every service.js file imports, so the
  base URL and auth header logic only exist in one place. This is
  the frontend mirror of the backend's config/env.js + authenticate.js
  combined.

What it holds:
  axiosInstance
    - baseURL: read from import.meta.env.VITE_API_BASE_URL (or
      process.env.REACT_APP_API_BASE_URL)
    - Request interceptor:
        - Reads the JWT from AuthContext/localStorage
        - Attaches Authorization: Bearer <token> to every request
    - Response interceptor:
        - If response is 401, clears stored auth state and redirects
          to the correct login page based on last known role
        - Otherwise passes the response/error through unchanged

----------------------------------------------------------------
FILE: src/utils/constants.js
----------------------------------------------------------------
What it does:
  Shared constant values used across many components, so magic
  strings like status names aren't retyped everywhere.

What it holds:
  EVENT_STATUS = { OPEN, FULL, APPLICATION_CLOSED, COMPLETED }
  EVENT_LEVEL = { UNIVERSITY, INSTITUTE, DEPARTMENT }
  APPLICATION_STATUS = { PENDING, APPROVED, REJECTED }
  ROLES = { STUDENT, FACULTY, ADMIN }

----------------------------------------------------------------
FILE: src/utils/formatDate.js
----------------------------------------------------------------
What it does:
  Small helper(s) so date formatting is consistent everywhere
  (event date, deadline countdowns, decision timestamps).

Functions it holds:
  formatDate(dateString)
    - Returns a human-readable date, e.g. "12 Aug 2026"

  isPast(dateString)
    - Returns true/false — used client-side to grey out "Apply"
      buttons before the server even responds (pure UX hint, the
      real check always happens server-side)


================================================================
MODULE 1: AUTH
================================================================
Covers login/register screens for Student and Faculty, login-only
for Admin, plus the global "who am I" context every other module
depends on.

----------------------------------------------------------------
FILE: src/context/AuthContext.jsx
----------------------------------------------------------------
What it does:
  The single source of truth for "who is logged in right now."
  Every protected route and every page that needs req.user
  server-side reads from here instead of re-deriving it.

What it holds:
  AuthContext (React Context)
  AuthProvider({ children })
    - State: { user, token, role, isLoading }
    - On mount: reads token from localStorage, if present calls
      authService.getMe() to hydrate user + role
    - login(token, user, role)
      - Stores token in localStorage
      - Sets user/role in state
    - logout()
      - Clears localStorage
      - Resets state to logged-out
    - Exposes { user, token, role, isLoading, login, logout } via
      context value

  useAuth()
    - Convenience hook: `const { user, role, login, logout } = useAuth()`
    - Just wraps useContext(AuthContext) so components don't import
      AuthContext directly

----------------------------------------------------------------
FILE: src/services/authService.js
----------------------------------------------------------------
What it does:
  Every axios call related to auth, one function per backend
  endpoint. Pages never call axios directly — they call these.

Functions it holds (--> backend endpoint):
  registerStudent(data)      --> POST /api/auth/student/register
  loginStudent(email, pw)    --> POST /api/auth/student/login
  registerFaculty(data)      --> POST /api/auth/faculty/register
                                  (kept here even though no UI links
                                  to it, in case an admin-invite flow
                                  is added later)
  loginFaculty(email, pw)    --> POST /api/auth/faculty/login
  loginAdmin(email, pw)      --> POST /api/auth/admin/login
  getMe()                    --> GET  /api/auth/me

  Each function:
    - Calls axiosInstance
    - Returns response.data (or throws so the calling page can
      show the error)

----------------------------------------------------------------
FILE: src/pages/auth/StudentLoginPage.jsx
----------------------------------------------------------------
What it does:
  Renders <LoginForm role="student" /> and wires it to
  authService.loginStudent + AuthContext.login, then redirects to
  /student/dashboard on success.

----------------------------------------------------------------
FILE: src/pages/auth/StudentRegisterPage.jsx
----------------------------------------------------------------
What it does:
  Renders <RegisterForm role="student" />.
  On success, shows "Registration successful — please log in" and
  redirects to /login/student (matches backend: register never
  returns a token, student must log in separately).

Fields it collects (mirrors studentRegisterSchema):
  fullName, studentId, email, password, instituteId (dropdown,
  populated from institutesService.listInstitutes()), departmentId
  (dropdown, populated from departmentsService.listDepartments
  filtered by the chosen instituteId), semester (1–12)

----------------------------------------------------------------
FILE: src/pages/auth/FacultyLoginPage.jsx
----------------------------------------------------------------
What it does:
  Same pattern as StudentLoginPage, calls loginFaculty, redirects
  to /faculty/dashboard.

----------------------------------------------------------------
FILE: src/pages/auth/AdminLoginPage.jsx
----------------------------------------------------------------
What it does:
  Same pattern, calls loginAdmin, redirects to /admin/dashboard.
  NOTE: There is intentionally no AdminRegisterPage — matches the
  backend rule that admin accounts are seeded via CLI, never via API.

----------------------------------------------------------------
FILE: src/components/auth/LoginForm.jsx
----------------------------------------------------------------
What it does:
  One shared, reusable form used by all three login pages via a
  `role` prop, so the email/password UI isn't duplicated three times.

Props:
  role ('student' | 'faculty' | 'admin')
  onSubmit(email, password)

What it does internally:
  - Local state for email/password/error/loading
  - Client-side check: both fields non-empty before submitting
    (real validation always happens server-side via loginSchema)
  - Shows the server's error message directly if login fails
    (e.g. "Invalid credentials")

----------------------------------------------------------------
FILE: src/routes/ProtectedRoute.jsx
----------------------------------------------------------------
What it does:
  The frontend's mirror of the backend's authenticate.js +
  authorize.js middleware combined. Wraps any route element and
  decides whether to render it, redirect to login, or redirect to
  an "unauthorized" page.

Props:
  role (the single role allowed to view this route)
  children

What it does:
  - Reads { user, role: currentRole, isLoading } from useAuth()
  - While isLoading: shows a loading spinner (avoids flashing a
    redirect before the token has even been checked)
  - If no user: redirects to the matching login page for `role`
  - If user exists but currentRole !== role: redirects to a
    /not-authorized page (mirrors backend's 403 "You do not have
    permission")
  - Otherwise renders children


================================================================
MODULE 2: INSTITUTES & DEPARTMENTS (reference data)
================================================================
Simple dropdown data. Used in three places: student registration,
event-creation forms (Institute/Department level targeting), and
one admin-only management screen each.

----------------------------------------------------------------
FILE: src/services/instituteService.js
----------------------------------------------------------------
Functions it holds (--> backend endpoint):
  listInstitutes()               --> GET    /api/institutes
  createInstitute(data)          --> POST   /api/institutes   (admin)
  updateInstitute(id, data)      --> PUT    /api/institutes/:id (admin)
  deleteInstitute(id)            --> DELETE /api/institutes/:id (admin)

----------------------------------------------------------------
FILE: src/services/departmentService.js
----------------------------------------------------------------
Functions it holds (--> backend endpoint):
  listDepartments(instituteId?)  --> GET    /api/departments?instituteId=
  createDepartment(data)         --> POST   /api/departments   (admin)
  updateDepartment(id, data)     --> PUT    /api/departments/:id (admin)
  deleteDepartment(id)           --> DELETE /api/departments/:id (admin)

----------------------------------------------------------------
FILE: src/components/shared/InstituteSelect.jsx
----------------------------------------------------------------
What it does:
  A `<select>` dropdown that loads institutes on mount and calls
  onChange with the chosen instituteId. Reused in registration and
  event-creation forms — the backend guide notes these dropdowns
  share the same lookup data, so the frontend shares one component
  for it too.

----------------------------------------------------------------
FILE: src/components/shared/DepartmentSelect.jsx
----------------------------------------------------------------
What it does:
  Same pattern, but re-fetches whenever the parent's selected
  instituteId prop changes (departments are scoped to an institute).
  Supports a `multiple` prop for the event-creation form's
  targetDepartmentIds array (Department-level events).

----------------------------------------------------------------
FILE: src/pages/admin/AdminInstitutesPage.jsx
----------------------------------------------------------------
What it does:
  Table of institutes with Add / Edit / Delete controls, all admin-
  only. Delete shows the server's specific error if it fails
  (backend throws 409 "Institute still has linked departments or
  users" — the UI surfaces that message rather than a generic one).

----------------------------------------------------------------
FILE: src/pages/admin/AdminDepartmentsPage.jsx
----------------------------------------------------------------
What it does:
  Same pattern as AdminInstitutesPage, filterable by institute,
  same 409-message handling on delete.


================================================================
MODULE 3: STUDENT
================================================================
Everything a logged-in student sees: eligible events, event detail,
applying, and their own application history.

----------------------------------------------------------------
FILE: src/services/studentService.js
----------------------------------------------------------------
Functions it holds (--> backend endpoint):
  getProfile()                       --> GET  /api/student/profile
  getEligibleEvents(filters)         --> GET  /api/student/events
  getEventById(id)                   --> GET  /api/student/events/:id
  applyToEvent(id, data)             --> POST /api/student/events/:id/apply
  getMyApplications(statusFilter?)   --> GET  /api/student/applications

  filters for getEligibleEvents: { status, dateFrom, dateTo, search }
  — matches the query params the backend controller reads.

----------------------------------------------------------------
FILE: src/pages/student/StudentDashboardPage.jsx
----------------------------------------------------------------
What it does:
  Landing page after student login. Shows profile summary
  (studentService.getProfile()) plus quick links into Events and
  My Applications.

----------------------------------------------------------------
FILE: src/pages/student/StudentEventListPage.jsx
----------------------------------------------------------------
What it does:
  Fetches getEligibleEvents() with whatever filters are active,
  renders a grid/list of <EventCard />. Holds the filter state
  (status, date range, search box) and passes it down.

  IMPORTANT: this only ever shows events the student is actually
  eligible for — the backend already filters by University/
  Institute/Department match, so no client-side eligibility logic
  is needed here; the frontend just displays what comes back.

----------------------------------------------------------------
FILE: src/pages/student/StudentEventDetailsPage.jsx
----------------------------------------------------------------
What it does:
  Reads :id from the URL, calls getEventById(id).
  If the backend responds 403 (student not eligible — e.g. someone
  guessed a URL), shows a "You are not eligible for this event"
  message instead of the event content — never falls back to
  showing partial event data.
  Renders <ApplyButton /> if event.status is Open and the deadline
  hasn't passed (client-side hint only — server re-checks
  everything on submit).

----------------------------------------------------------------
FILE: src/components/student/ApplyForm.jsx
----------------------------------------------------------------
What it does:
  Small form/modal shown when a student clicks Apply.

Fields it collects (mirrors applySchema):
  previousExperience (optional string)
  NOTE: fullName/studentId/semester/email are never collected here —
  matches the backend rule that those are always pulled from the
  authenticated student's own profile server-side, never trusted
  from the client.

What it does on submit:
  - Calls studentService.applyToEvent(eventId, { previousExperience })
  - On success: shows confirmation, disables the Apply button
  - On 403: shows "You are not eligible for this event"
  - On 400: shows the specific reason (event not Open / deadline
    passed)
  - On 409: shows "You already have an active application for this
    event"

----------------------------------------------------------------
FILE: src/pages/student/MyApplicationsPage.jsx
----------------------------------------------------------------
What it does:
  Calls getMyApplications(), optional status filter tabs
  (Pending / Approved / Rejected / All). Renders a list of
  <ApplicationStatusCard />. Reminds the student that a Rejected
  application does not block re-applying while the event is still
  Open (matches the backend rule directly).


================================================================
MODULE 4: EVENTS (core module — Faculty & Admin views)
================================================================
Faculty and Admin each get their own pages/services (different
permissions, mirrors the backend having faculty.routes.js and
admin.routes.js as separate files), but both ultimately talk to
the same underlying event/application data.

----------------------------------------------------------------
FILE: src/services/facultyEventService.js
----------------------------------------------------------------
Functions it holds (--> backend endpoint):
  getAllEvents(filters)                  --> GET   /api/faculty/events
  getEventById(id)                       --> GET   /api/faculty/events/:id
  createEvent(data)                      --> POST  /api/faculty/events
  updateEvent(id, data)                  --> PUT   /api/faculty/events/:id
  reopenEvent(id)                        --> PATCH /api/faculty/events/:id/reopen
  archiveEvent(id)                       --> PATCH /api/faculty/events/:id/archive
  notifyStudents(id)                     --> POST  /api/faculty/events/:id/notify
  getApplicationsForEvent(id, status?)   --> GET   /api/faculty/events/:id/applications
  approveApplication(appId)              --> PATCH /api/faculty/applications/:id/approve
  rejectApplication(appId)               --> PATCH /api/faculty/applications/:id/reject

----------------------------------------------------------------
FILE: src/services/adminEventService.js
----------------------------------------------------------------
Functions it holds (--> backend endpoint):
  getAllEvents(filters)      --> GET    /api/admin/events
  getEventById(id)           --> GET    /api/admin/events/:id
  updateEvent(id, data)      --> PUT    /api/admin/events/:id
  deleteEvent(id)            --> DELETE /api/admin/events/:id
  archiveEvent(id)           --> PATCH  /api/admin/events/:id/archive
  getAllApplications(filters)--> GET    /api/admin/applications

----------------------------------------------------------------
FILE: src/pages/faculty/FacultyEventListPage.jsx
----------------------------------------------------------------
What it does:
  Table/grid of every event created by anyone (backend applies no
  ownership filter on read), with an "Edit" action only enabled for
  events this faculty member created — the page compares
  event.createdBy to the logged-in user's id from AuthContext to
  decide whether to show Edit/Reopen/Archive/Notify, since the
  backend will 403 anyway but showing disabled buttons is better UX.

----------------------------------------------------------------
FILE: src/pages/faculty/FacultyEventFormPage.jsx
----------------------------------------------------------------
What it does:
  One page, two modes based on whether :id is present in the URL —
  create mode posts to createEvent(), edit mode loads the existing
  event then puts to updateEvent(id, ...).

Fields it collects (mirrors createEventSchema / updateEventSchema):
  title, description, eventDate, applicationDeadline,
  volunteerCapacity, eventLevel (University/Institute/Department)
  targetInstituteId — only shown/required if eventLevel is Institute
  targetDepartmentIds — only shown/required (multi-select via
    <DepartmentSelect multiple />) if eventLevel is Department

Client-side checks before submit (server re-validates regardless):
  - applicationDeadline must be before eventDate
  - both dates must be in the future

----------------------------------------------------------------
FILE: src/pages/faculty/FacultyEventDetailsPage.jsx
----------------------------------------------------------------
What it does:
  Shows one event's full detail plus action buttons: Edit, Reopen,
  Archive, Notify Students — each only rendered if this faculty
  member owns the event.

  Reopen button:
    - On failure, shows the SPECIFIC reason returned by the backend
      ("Cannot reopen: application deadline has already passed" or
      "...volunteer capacity already reached") rather than a generic
      error — the backend guide is explicit that this must never be
      generic, so the frontend must not swallow that detail either.

  Notify Students button:
    - Calls notifyStudents(id)
    - Shows a confirmation toast with the emailsSent count returned
    - No cooldown/disable logic — matches backend, which allows
      clicking it as many times as wanted
    - Should show a loading state while the request is in flight,
      since sending to potentially hundreds of students may take a
      few seconds

----------------------------------------------------------------
FILE: src/pages/faculty/FacultyApplicationsPage.jsx
----------------------------------------------------------------
What it does:
  Reads :id (event id) from the URL, calls
  getApplicationsForEvent(id, statusFilter), renders a table with
  Approve/Reject buttons per Pending row.

  Approve button:
    - Calls approveApplication(appId)
    - On 409 ("Event capacity already reached"): shows that message
      and leaves the row as Pending (matches backend — application
      is NOT auto-rejected just because one approval attempt failed)
    - On success: refreshes the list (an approval may have also
      triggered checkAndCloseIfFull() server-side, which can bulk-
      reject other Pending rows — so a full refetch, not just a
      local state patch, keeps the UI honest)

  Reject button:
    - Calls rejectApplication(appId), refreshes the row

----------------------------------------------------------------
FILE: src/pages/admin/AdminEventListPage.jsx
----------------------------------------------------------------
What it does:
  Same table pattern as the faculty list, but every Edit/Delete/
  Archive action is enabled for every event — no ownership check
  needed, matches admin.controller.js having no ownership guard.

----------------------------------------------------------------
FILE: src/pages/admin/AdminEventDetailsPage.jsx
----------------------------------------------------------------
What it does:
  Same as faculty details page, but the destructive action is
  "Delete" (hard delete, irreversible) instead of "Archive"-only.
  Shows a confirmation dialog before calling deleteEvent(id) —
  since the backend guide is explicit this is a permanent,
  admin-only override that faculty never gets.

----------------------------------------------------------------
FILE: src/pages/admin/AdminApplicationsPage.jsx
----------------------------------------------------------------
What it does:
  Calls getAllApplications(filters) — the one place in the app that
  sees every application across every event/student. Filters:
  status, eventId, studentId (read from query params so links from
  other pages, e.g. "view this event's applications as admin," can
  deep-link in with a filter already applied).

----------------------------------------------------------------
FILE: src/components/events/EventCard.jsx
----------------------------------------------------------------
What it does:
  Small reusable card: title, date, deadline countdown, capacity
  (approvedCount / volunteerCapacity), status badge. Used in student
  list, faculty list, and admin list with a `variant` prop that
  toggles which action buttons show.

----------------------------------------------------------------
FILE: src/components/events/StatusBadge.jsx
----------------------------------------------------------------
What it does:
  Colored pill showing Open / Full / ApplicationClosed / Completed,
  shared everywhere an event's status is displayed so the color
  coding never drifts between pages.


================================================================
MODULE 5: APPLICATIONS (shared components)
================================================================
Small pieces reused by both the faculty applications page and the
student's own applications page.

----------------------------------------------------------------
FILE: src/components/applications/ApplicationStatusCard.jsx
----------------------------------------------------------------
What it does:
  One application's card: event title, applied-on date, status
  badge, and — if decided — decisionAt and (for faculty/admin view)
  who decided it.

----------------------------------------------------------------
FILE: src/components/applications/ApproveRejectButtons.jsx
----------------------------------------------------------------
What it does:
  The two-button control used only on the faculty applications
  table. Disabled once status is no longer Pending. Emits
  onApprove()/onReject() callbacks; the parent page owns the actual
  service calls and refetching.


================================================================
MODULE 6: NOTIFICATIONS (frontend has no dedicated pages)
================================================================
There is no notifications inbox in this app — "Notify Students" is
a one-way action button embedded in FacultyEventDetailsPage
(Module 4), not its own module. This section exists only so the
module numbering matches the backend guide 1:1.


================================================================
MODULE 7: CLEANUP & SCHEDULING (no frontend equivalent)
================================================================
Cron-driven auto-close and auto-delete happen entirely server-side.
The only frontend-visible effect is that an event's status may
silently change to Full / ApplicationClosed / Completed between
page loads — pages should always refetch on mount rather than trust
stale status from a previous navigation, and should not assume a
status they set locally is still accurate after any wait.


================================================================
SHARED FILES (used across every module)
================================================================

----------------------------------------------------------------
FILE: src/components/layout/Navbar.jsx
----------------------------------------------------------------
What it does:
  Top navigation, contents change based on useAuth().role — shows
  Student links, Faculty links, or Admin links, plus a Logout button
  that calls AuthContext.logout() and redirects to /.

----------------------------------------------------------------
FILE: src/components/layout/Loader.jsx
----------------------------------------------------------------
What it does:
  One shared spinner/skeleton component, used by every page while
  its data is in flight — keeps loading states visually consistent.

----------------------------------------------------------------
FILE: src/components/shared/ErrorMessage.jsx
----------------------------------------------------------------
What it does:
  Renders a backend error consistently. Reads the standardized
  error shape the backend guide documents:
    { success: false, statusCode, message }
  and displays `message` — so every page shows the server's actual
  reason (e.g. "Event capacity already reached") instead of a
  generic "Something went wrong."

----------------------------------------------------------------
FILE: src/components/shared/ConfirmDialog.jsx
----------------------------------------------------------------
What it does:
  Generic "Are you sure?" modal, reused before any destructive
  action (archive, hard delete, reject).

----------------------------------------------------------------
FILE: src/pages/NotFoundPage.jsx
----------------------------------------------------------------
What it does:
  Rendered for any unmatched URL — the frontend's equivalent of the
  backend's notFound.js + errorHandler.js pair, just for routing
  instead of HTTP.

----------------------------------------------------------------
FILE: .env  (Vite: variables must start with VITE_)
----------------------------------------------------------------
What it holds:
  VITE_API_BASE_URL   --> e.g. http://localhost:5000/api
  (Mirrors the backend's CLIENT_URL — the two projects each need to
  know the other's origin: backend needs it for cors(), frontend
  needs it as the axios baseURL.)


================================================================
QUICK REFERENCE: Which file to edit for common tasks
================================================================

  I need to add a new page/screen
    --> Create it in pages/<module>/, then register the route in
        App.jsx (wrap in <ProtectedRoute> if it needs auth)

  I need to change what an API call sends/expects
    --> Edit the matching function in services/<module>Service.js

  I need to change how a piece of UI looks/behaves everywhere
    --> Edit the shared component in components/shared/ or
        components/layout/ (never copy-paste the same UI twice)

  I need to change login/token/role behavior
    --> Edit context/AuthContext.jsx or routes/ProtectedRoute.jsx

  I need to change a form's fields or client-side checks
    --> Edit that form's component (e.g. FacultyEventFormPage.jsx,
        ApplyForm.jsx) — but remember the server-side validation.js
        schema is still the real source of truth

  I need to change the base API URL (e.g. moving to production)
    --> Edit .env, change VITE_API_BASE_URL

  I need to add a new role-based restriction to a page
    --> Wrap it in <ProtectedRoute role="..."> in App.jsx

  I need to show a new error message more specifically
    --> Check ErrorMessage.jsx is reading response.data.message —
        do not hardcode a generic string in the page itself


================================================================
END OF DOCUMENT
================================================================
