Attendance Management API
A RESTful API for managing users, departments, buildings/rooms, subjects, subject assignments, attendance (time in/out and QR scan), notifications, and leave requests. Built with Node.js (NestJS) and PostgreSQL, using JWT for authentication.

Language: TypeScript
Framework: NestJS
Database: PostgreSQL
Auth: JWT Bearer tokens
API style: Conventional REST with JSON payloads
Table of Contents
Overview
Architecture
Getting Started
Environment Configuration
Authentication
Error Handling
Resources and Endpoints
Auth
Users
Profile
Departments
Buildings
Rooms
Subjects
Subject Assignment
Attendance
Notifications
Leave Requests
Sample Workflows
Testing with Postman
Changelog
License
Overview
This API supports core attendance operations for an organization:

Onboarding users and managing roles
Structuring departments, buildings, and rooms
Defining subjects and assigning them to employees
Recording attendance with time in/out, including QR-based scans
Managing notifications
Submitting and approving leave requests
Use the provided Postman collection “Attendance Management” to explore the API locally.

Architecture
Modular NestJS architecture (controllers, services, modules)
PostgreSQL for persistence
JWT-based authentication and role-based access control
REST endpoints, JSON payloads, conventional status codes
Getting Started
Prerequisites:

Node.js 18+
PostgreSQL 13+
pnpm or npm
Steps:

Clone the repository
Install dependencies:
pnpm install
or npm install
Configure environment variables (see Environment Configuration)
Run database migrations/seeding if applicable
Start the app:
pnpm start:dev
or npm run start:dev
Base URL (local): 
http://localhost:8000
Environment Configuration
Add a .env file with (example values):

PORT=8000
DATABASE_URL=postgres://user:password@localhost:5432/attendance
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
Optional application-level flags as needed by your Nest config.

Authentication
Obtain a token via POST /auth/login
Send Authorization: Bearer on protected routes
Some endpoints (e.g., /auth/register) may be public; administrative routes require elevated roles
Example login request: POST 
http://localhost:8000/auth/login
 Body: { "email": "
user@example.com
", "password": "password123" }

Response: { "access_token": "jwt.token.here", "user": { ... } }

Use the token on subsequent requests: Authorization: Bearer

Error Handling
400 Bad Request: Invalid inputs
401 Unauthorized: Missing/invalid token
403 Forbidden: Insufficient role/permission
404 Not Found: Resource missing
409 Conflict: Resource state conflicts
422 Unprocessable Entity: Validation errors
500 Internal Server Error: Unexpected server issues
Responses include an error message and optional details field for debugging.

Resources and Endpoints
Base URL: 
http://localhost:8000

Notes:

Many endpoints require a valid JWT
Admin-only routes are noted
IDs below are examples
Auth

POST /auth/register
POST /auth/login
GET /users/current — get current logged-in user
Users

GET /users — admin: list all users
GET /users/current — current user profile summary
GET /users/{id} — admin: get a user by id
PUT /users/{id} — admin: update user
DELETE /users/{id} — admin: delete user
PATCH /users/{id}/departments — admin: assign user to department
GET /users/all-employees — list users with employee role
GET /users/user-role — filter by role via query params (implementation dependent)
Profile

POST /profile — create own profile
GET /profile — get own profile
PATCH /profile/{id} — update profile
DELETE /profile/{id} — delete profile
Departments

GET /departments — list all
POST /departments — create (admin)
GET /departments/{id}/details — department details
PUT /departments/{id} — update (admin)
DELETE /departments/{id} — delete (admin)
GET /departments/{id}/employees — list users in department
GET /departments/own — get current user’s department
Buildings

GET /buildings — list all
GET /buildings/{id} — get by id
POST /buildings — create (admin)
PATCH /buildings/{id} — update (admin)
DELETE /buildings/{id} — delete (admin)
Rooms

GET /rooms — list all
GET /rooms/{id} — get by id
POST /rooms — create (admin)
PATCH /rooms/{id} — update (admin)
DELETE /rooms/{id} — delete (admin)
Subjects

GET /subjects — list all
GET /subjects/{id} — get by id
POST /subjects — create (admin)
DELETE /subjects/{id} — delete (admin)
Subject Assignment

POST /subject-assignment — create assignment (admin)
PATCH /subject-assignment/{id} — update schedule (admin)
DELETE /subject-assignment/{id} — remove assignment (admin)
GET /subject-assignment/employee?date=YYYY-MM-DD — current user’s assigned subjects by date
GET /subject-assignment/employees-load/{userId} — user load summary
Attendance

POST /attendance/time-in — standard time-in
POST /attendance/time-out — standard time-out
POST /attendance/qr/scan-timein — QR time-in
POST /attendance/qr/scan-timeout — QR time-out
GET /attendance/employee/own?year-month=YYYY-MM — current user’s attendance log for a month
GET /attendance/admin/attendance-log?year-month=YYYY-MM — admin: all employees’ logs for a month
Notifications

GET /notification/me — list own notifications
PATCH /notification/{id} — mark as read
DELETE /notification/{id} — delete notification
Leave Requests

POST /leave-request — create new leave request
GET /leave-request/own-request — current user’s requests
GET /leave-request — admin/hr: list all requests
PATCH /leave-request/{id} — admin/hr: decision (approve/deny)
DELETE /leave-request/{id} — delete own request (or admin rules per policy)
Sample Workflows
Onboard and assign employee
Admin registers or creates user
Create department, building, and rooms
Assign user to a department
Create subjects and subject assignments
Daily attendance
User time-in via POST /attendance/time-in or QR scan
User time-out via POST /attendance/time-out or QR scan
User checks own log via GET /attendance/employee/own?year-month=YYYY-MM
Admin reviews monthly logs via GET /attendance/admin/attendance-log?year-month=YYYY-MM
Leave request lifecycle
User creates a leave request via POST /leave-request
HR/Admin reviews via GET /leave-request
HR/Admin decides via PATCH /leave-request/{id} (approve/deny)
User can view via GET /leave-request/own-request
