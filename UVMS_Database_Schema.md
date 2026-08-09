# University Volunteer Management System (UVMS)
## Database Schema Design (MongoDB / Mongoose)

This document defines all data models required for the backend, based on the
Final SRS v1. Stack: Node.js + Express + MongoDB (Mongoose ODM).

Design approach: separate collections per role (Student, Faculty, Admin)
rather than one unified `User` collection with a role field. This is chosen
because each role has genuinely different fields (Student has semester/
studentId, Faculty doesn't), different registration flows (separate faculty
endpoint, seeded admin), and different feature sets — keeping them separate
avoids a model full of "only applies if role === X" optional fields and
keeps auth/authorization checks simpler (query the right collection based on
login endpoint used).

---

## 1. Institute

Represents a university institute (e.g., "Institute of Technology").

```js
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true }, // short code e.g. "IT"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** `name` (unique), `code` (unique)

---

## 2. Department

Represents a department belonging to one institute.

```js
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true }, // e.g. "CSE"
  instituteId: { type: ObjectId, ref: 'Institute', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** compound unique on `(instituteId, code)` — code must be unique
within an institute, but two institutes can each have e.g. a "CSE" department.

**Note:** Every student and faculty belongs to exactly one department (per
your confirmation), and every department belongs to exactly one institute.
This is a strict hierarchy — no many-to-many at the student/department level.

---

## 3. Student

```js
{
  _id: ObjectId,
  fullName: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, unique: true, trim: true }, // university roll/ID number
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // official university email
  passwordHash: { type: String, required: true },
  instituteId: { type: ObjectId, ref: 'Institute', required: true },
  departmentId: { type: ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true, min: 1, max: 12 },
  isActive: { type: Boolean, default: true }, // soft-disable flag, admin use
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** `email` (unique), `studentId` (unique), `departmentId`
(for fast eligibility filtering), `instituteId`

**Validation notes:**
- `email` should be validated against the official university domain at the
  application layer (e.g. regex/whitelist check on register).
- `instituteId` should match the institute that owns `departmentId` — enforce
  at the application layer since MongoDB has no native cross-document FK
  constraint.

---

## 4. Faculty

Registered via a separate, unlisted register endpoint (not linked from
student-facing UI).

```js
{
  _id: ObjectId,
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  instituteId: { type: ObjectId, ref: 'Institute', required: true },
  departmentId: { type: ObjectId, ref: 'Department', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** `email` (unique)

**Note:** Faculty's own institute/department isn't strictly required by the
SRS (faculty can view/create events at any level), but it's useful metadata
for display and audit ("Faculty X from CSE created this event"). Flag this
as an assumption — let me know if you want it removed.

---

## 5. Administrator

Seeded directly via a one-time/internal API call — no public registration
endpoint at all.

```js
{
  _id: ObjectId,
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** `email` (unique)

---

## 6. Event

Core entity. `eventLevel` determines which of `targetInstituteId` /
`targetDepartmentIds` is populated.

```js
{
  _id: ObjectId,
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eventDate: { type: Date, required: true },
  applicationDeadline: { type: Date, required: true },
  volunteerCapacity: { type: Number, required: true, min: 1 },
  approvedCount: { type: Number, default: 0 }, // denormalized counter, see note below

  eventLevel: {
    type: String,
    enum: ['University', 'Institute', 'Department'],
    required: true
  },

  // populated only if eventLevel === 'Institute'
  targetInstituteId: { type: ObjectId, ref: 'Institute', default: null },

  // populated only if eventLevel === 'Department'
  // supports multiple departments, possibly across different institutes
  targetDepartmentIds: [{ type: ObjectId, ref: 'Department' }],

  status: {
    type: String,
    enum: ['Open', 'Full', 'ApplicationClosed', 'Completed', 'Archived'],
    default: 'Open'
  },
  isArchived: { type: Boolean, default: false }, // manual flag, protects from auto-cleanup job

  createdBy: { type: ObjectId, ref: 'Faculty', required: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:** `createdBy`, `eventLevel`, `status`, `applicationDeadline`,
`targetInstituteId`, `targetDepartmentIds` (multikey index)

**Design notes:**
- **`approvedCount`** is a denormalized running total of Approved
  applications, updated atomically (`$inc`) whenever an application is
  approved/reverted. This avoids counting the full `VolunteerApplication`
  collection on every capacity check and is what makes concurrency-safe
  approval checks practical (see Business Logic Notes below).
- **`isArchived`** is kept separate from `status`. Reasoning: `status`
  reflects the event's natural lifecycle (Open → Full/ApplicationClosed →
  Completed), while archiving is a manual protective action that can happen
  at any point and just exempts the event from the auto-delete job. If you'd
  rather fold this into `status` as a literal `'Archived'` value that
  overrides lifecycle status, that's also workable — flagging this as a
  design choice, not a fixed requirement.
- Since you confirmed a student belongs to exactly one department, no dedup
  logic is needed when resolving `targetDepartmentIds` → student list.

---

## 7. EventDepartmentMapping

The SRS explicitly lists this as a core entity. In a relational DB this
would just be the join table for Event↔Department. In MongoDB,
`targetDepartmentIds` on the Event document already captures this
relationship for a Department-level event.

I'm keeping this as its own thin collection anyway, for one reason: **fast
reverse lookups** — "which events is department X eligible for?" — without
scanning every Event document's array. This matters for the student-facing
"eligible events" query, which is one of the most frequent reads in the
system.

```js
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true },
  departmentId: { type: ObjectId, ref: 'Department', required: true },
  instituteId: { type: ObjectId, ref: 'Institute', required: true }, // denormalized, avoids a join to filter by institute too
  createdAt: { type: Date, default: Date.now }
}
```

**Indexes:** compound unique on `(eventId, departmentId)`; separate index on
`departmentId` alone for the reverse lookup.

**Note:** This is a derived/denormalized collection — one row is created
per `(event, department)` pair whenever a Department-level event is created
or edited. It's kept in sync with `Event.targetDepartmentIds`
programmatically, not by the client. If you'd prefer to skip this
collection entirely and just query `Event.targetDepartmentIds` directly with
a multikey index, that's simpler and totally viable at moderate scale — let
me know which you'd prefer when we get to the actual query/API design.

---

## 8. VolunteerApplication

```js
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event', required: true },
  studentId: { type: ObjectId, ref: 'Student', required: true },

  // snapshot fields captured at time of application (per SRS Section 7)
  fullName: { type: String, required: true },
  studentIdNumber: { type: String, required: true }, // snapshot of Student.studentId
  semester: { type: Number, required: true },
  email: { type: String, required: true },
  previousExperience: { type: String, default: null }, // optional

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  decisionBy: { type: ObjectId, ref: 'Faculty', default: null },
  decisionAt: { type: Date, default: null },
  decisionReason: { type: String, default: null }, // e.g. "auto-rejected: deadline passed" / "auto-rejected: capacity reached"

  appliedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- Compound index on `(eventId, studentId)` — needed to check "does this
  student already have an active application for this event."
- `(eventId, status)` — for faculty reviewing pending applications and for
  the capacity-counting job.
- `(studentId, status)` — for a student's "my applications" view.

**Enforcing "one active application per student per event":** MongoDB
doesn't support conditional unique indexes across arbitrary field values
directly in a simple way, but a **partial unique index** handles this
cleanly:

```js
schema.index(
  { eventId: 1, studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['Pending', 'Approved'] } }
  }
);
```

This allows unlimited `Rejected` applications for the same
student+event pair (supporting reapplication) while guaranteeing at most one
`Pending` or `Approved` application exists at a time — enforced at the
database level, not just application logic.

**Snapshot fields:** `fullName`, `studentIdNumber`, `semester`, `email` are
copied from the Student document at time of application rather than always
joined live. This preserves historical accuracy (e.g., if a student's
semester changes later, the application still reflects what it was when
they applied) and matches SRS Section 7's field list.

---

## Entity Relationship Summary

```
Institute (1) ───< Department (many)
Institute (1) ───< Faculty (many)
Institute (1) ───< Student (many)
Department (1) ───< Student (many)
Department (1) ───< Faculty (many)

Faculty (1) ───< Event (many)              [createdBy]
Event (1) ───< EventDepartmentMapping (many)   [Department-level events only]
Department (1) ───< EventDepartmentMapping (many)

Event (1) ───< VolunteerApplication (many)
Student (1) ───< VolunteerApplication (many)
Faculty (1) ───< VolunteerApplication (many)   [decisionBy]
```

---

## Business-Logic Notes for Later (Not Schema, But Related)

These aren't part of the schema itself but will matter when we design the
API/service layer next, so flagging them now:

1. **Concurrency-safe approval:** When faculty approves an application,
   increment `Event.approvedCount` atomically and check against
   `volunteerCapacity` in the same operation (e.g., a single
   `findOneAndUpdate` with a query condition like
   `{ approvedCount: { $lt: volunteerCapacity } }`), to avoid a race
   condition where two approvals happen simultaneously and exceed capacity.
2. **Auto-close jobs:** Scheduled jobs (e.g., node-cron) needed for:
   - Deadline-passed sweep → cancel all `Pending` apps for events whose
     `applicationDeadline` has passed, set event status accordingly.
   - Capacity-reached trigger → fires at approval time, not on a schedule.
   - Completed → Archived/auto-delete sweep → 1 year after `eventDate` (or
     after `status = Completed`?) delete Event + associated
     VolunteerApplications, unless `isArchived === true`.
3. **Reopen validation:** When faculty attempts to reopen a closed event,
   check `applicationDeadline > now` AND `approvedCount < volunteerCapacity`
   before allowing it; return a specific error message for whichever
   condition failed.

I'll flesh these into full API/service logic when we get to that stage —
for now this document is just the data layer.
