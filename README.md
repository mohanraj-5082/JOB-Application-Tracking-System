# Job Tracker Backend

Job Tracker is a Spring Boot REST backend for creating, viewing, updating, deleting, and filtering job applications.

This documentation describes the behavior currently implemented in the backend. It does not introduce additional endpoints or features.

## Tech stack

- Java 25
- Spring Boot 4.1.0
- Spring MVC
- Spring Security with BCrypt and JWT authentication
- Spring Data JPA / Hibernate
- Jakarta Bean Validation
- MySQL (runtime database)
- Lombok
- Maven Wrapper
- JUnit, Spring MVC test support, Spring Data JPA test support, and H2 for deterministic automated tests

## Architecture

Requests are handled by `JobController`, which validates request DTOs and delegates application work to `JobService`. The service maps between DTOs and the `Job` entity and uses `JobRepository` for persistence. `GlobalExceptionHandler` converts validation, query-parameter conversion, and invalid date-range errors into JSON 400 responses.

```text
HTTP request
    -> JobController
    -> JobService
    -> JobRepository
    -> MySQL jobs table
```

## Package structure

```text
src/main/java/com/mohanraj/jobtracker/
├── JobTrackerApplication.java
├── JobResponseDTO.java
├── controller/
│   └── JobController.java
├── dto/
│   └── JobRequestDTO.java
├── exception/
│   └── GlobalExceptionHandler.java
├── model/
│   ├── Job.java
│   └── JobStatus.java
├── repository/
│   └── JobRepository.java
└── service/
    └── JobService.java

src/test/java/com/mohanraj/jobtracker/
└── JobTrackerApplicationTests.java
```

## Database configuration

The current runtime configuration is in `src/main/resources/application.properties`:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/job_tracker}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=${JPA_SHOW_SQL:false}
```

Database values can be supplied with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. Authentication uses `JWT_SECRET`, `JWT_EXPIRATION_MS`, and `APP_CORS_ALLOWED_ORIGIN`; set a long random JWT secret outside local development.

## Database migration and ownership rollout

The application does not include Flyway or Liquibase. Ownership is shipped as explicit, reviewed MySQL scripts in `database/migrations/`:

1. Back up the database and run `001_add_job_owner_nullable.sql`. It adds the nullable `jobs.user_id` column and foreign key without deleting existing jobs.
2. Existing jobs have no historical owner. Copy `002_backfill_legacy_job_owner.sql.template` to an untracked SQL file, replace the placeholder with an approved existing user email, review the count, and run it.
3. Confirm `remaining_jobs_without_owner` is `0`, then run `003_enforce_job_owner_not_null.sql`. This makes ownership mandatory and fails if any orphan jobs remain.
4. Start the application with the `prod` profile. Production uses `ddl-auto=validate`, so future schema changes must be reviewed migrations rather than automatic JPA updates.

Do not assign legacy jobs to an arbitrary user. If ownership cannot be determined, retain them in a backup or quarantine table and resolve them before applying the final `NOT NULL` step.

## Authentication

Register and log in through the public endpoints:

```http
POST /api/auth/register
POST /api/auth/login
```

Both accept `{ "email": "user@example.com", "password": "at-least-8-characters" }`. Registration returns `201 Created`; login returns `200 OK`. Each response contains a bearer JWT and expiry metadata. All `/api/jobs/**` endpoints require `Authorization: Bearer <token>`.

The frontend stores the access token in browser `sessionStorage`, attaches it through the centralized Axios client, and clears it on logout or a `401 Unauthorized` response. For stronger browser-side protection in a public deployment, move token handling to secure, HttpOnly cookies with an appropriate CSRF strategy.

Before starting the application, make sure MySQL is running, the `job_tracker` database exists, and the configured credentials are valid. For a shared or production environment, replace the credentials with environment-specific configuration rather than committing real passwords.

The `jobs` table is managed by JPA with `ddl-auto=update`. The `Job` entity contains:

| Field | Type | Required |
|---|---|---|
| `id` | `Long` | Generated automatically |
| `owner` | `AppUser` | Yes; authenticated owner |
| `companyName` | `String` | Yes |
| `jobTitle` | `String` | Yes |
| `status` | `JobStatus` | Yes |
| `applicationDate` | `LocalDate` | Yes |

Allowed status values are `APPLIED`, `INTERVIEW`, `OFFER`, and `REJECTED`.

## Running the application

The API base URL is:

```text
http://localhost:8080
```

Compile the application:

```powershell
.\mvnw.cmd clean compile
```

Start Spring Boot:

```powershell
.\mvnw.cmd spring-boot:run
```

For development, use the development profile:

```powershell
$env:JWT_SECRET="local-only-long-random-secret"
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

For production, provide the variables in the root `.env.example` through the hosting platform's secret/environment configuration and start with `SPRING_PROFILES_ACTIVE=prod`. Do not copy secret values into tracked files. The production profile requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `APP_CORS_ALLOWED_ORIGIN`; it validates the schema instead of changing it.

The application starts on the default Spring Boot port, `8080`.

## Running tests

Run the complete automated test suite:

```powershell
.\mvnw.cmd clean test
```

The tests use an isolated in-memory H2 database and recreate deterministic data before each test. They do not depend on manually existing MySQL records.

## Maven Wrapper commands

```powershell
# Compile production sources
.\mvnw.cmd clean compile

# Run all tests
.\mvnw.cmd clean test

# Run the application
.\mvnw.cmd spring-boot:run
```

## API reference

All endpoints use the `/api` prefix. JSON request bodies must use `Content-Type: application/json`.

### Create a job

```text
POST /api/jobs
```

Creates a job application.

Request body:

```json
{
  "companyName": "Example Technologies",
  "jobTitle": "Java Developer",
  "status": "APPLIED",
  "applicationDate": "2026-08-15"
}
```

Successful response: `200 OK` with the created job, including its generated ID.

```json
{
  "id": 1,
  "companyName": "Example Technologies",
  "jobTitle": "Java Developer",
  "status": "APPLIED",
  "applicationDate": "2026-08-15"
}
```

Possible errors:

- `400 Bad Request` when a required field is missing, blank, or null.

### List jobs

```text
GET /api/jobs
```

Returns jobs as a JSON array. Results can be paginated, sorted, searched, and filtered.

Query parameters:

| Parameter | Required | Description |
|---|---|---|
| `page` | No | Zero-based page number. Default is Spring Data's default page number, `0`. |
| `size` | No | Maximum number of results in a page. |
| `sort` | No | Sort field and direction, for example `applicationDate,desc` or `companyName,asc`. |
| `status` | No | One of `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`. |
| `search` | No | Case-insensitive partial match against `companyName` or `jobTitle`. Leading and trailing whitespace is trimmed. |
| `fromDate` | No | Inclusive lower bound for `applicationDate`, formatted as `yyyy-MM-dd`. |
| `toDate` | No | Inclusive upper bound for `applicationDate`, formatted as `yyyy-MM-dd`. |

Examples:

```text
GET /api/jobs?page=0&size=2
GET /api/jobs?sort=companyName,asc
GET /api/jobs?status=APPLIED
GET /api/jobs?search=java
GET /api/jobs?fromDate=2026-08-01&toDate=2026-08-31
GET /api/jobs?search=java&status=APPLIED&fromDate=2026-08-01&toDate=2026-08-31&page=0&size=2&sort=applicationDate,desc
```

Successful response: `200 OK` with a JSON array. Pagination metadata is not returned by the current controller.

```json
[
  {
    "id": 1,
    "companyName": "Example Technologies",
    "jobTitle": "Java Developer",
    "status": "APPLIED",
    "applicationDate": "2026-08-15"
  }
]
```

Possible errors:

- `400 Bad Request` for an invalid status, invalid date format, or a `fromDate` later than `toDate`.

### Get a job by ID

```text
GET /api/jobs/{id}
```

Returns one existing job. The path parameter `id` is the job's numeric database ID.

Successful response: `200 OK` with a job response object.

Possible errors:

- `404 Not Found` when no job exists with the supplied ID.

### Update a job

```text
PUT /api/jobs/{id}
```

Replaces the editable fields of an existing job. The request body uses the same required fields as job creation.

Request body:

```json
{
  "companyName": "Example Technologies",
  "jobTitle": "Senior Java Developer",
  "status": "INTERVIEW",
  "applicationDate": "2026-08-20"
}
```

Successful response: `200 OK` with the updated job response object.

Possible errors:

- `400 Bad Request` when a required request field is invalid.
- `404 Not Found` when no job exists with the supplied ID.

### Delete a job

```text
DELETE /api/jobs/{id}
```

Deletes an existing job by numeric ID. This endpoint has no request body.

Successful response: `204 No Content`.

Possible errors:

- `404 Not Found` when no job exists with the supplied ID.

## Response and error formats

### Validation error

Validation errors from create or update requests return `400 Bad Request` as a field-to-message JSON object:

```json
{
  "companyName": "Company name cannot be empty",
  "jobTitle": "Job title cannot be empty",
  "status": "Status cannot be empty",
  "applicationDate": "Application date cannot be empty"
}
```

### Invalid query parameter

An invalid status returns:

```http
400 Bad Request
```

```json
{
  "status": "must be one of APPLIED, INTERVIEW, OFFER, REJECTED"
}
```

An invalid date format returns:

```json
{
  "fromDate": "must be a valid date in yyyy-MM-dd format"
}
```

When `fromDate` is later than `toDate`, the response is:

```json
{
  "dateRange": "fromDate must be before or equal to toDate"
}
```

## HTTP status summary

| Status | Current use |
|---|---|
| `200 OK` | Successful create, read, list, and update operations |
| `204 No Content` | Successful deletion |
| `400 Bad Request` | Request validation failures and invalid query parameters |
| `404 Not Found` | Requested job does not exist for read, update, or delete |

The current create endpoint returns `200 OK`; it does not return `201 Created`.

## Frontend

The React frontend lives in the separate `frontend/` directory. It provides the application shell, authentication screens, a functional dashboard, and a Jobs workspace connected to the existing CRUD API. The Jobs workspace supports user-scoped job CRUD, search, status/date filters, pagination, and sorting. Deployment automation is not implemented yet.

Install frontend dependencies and start the Vite development server:

```powershell
cd frontend
npm install
npm run dev
```

For a local setup, copy the example environment file to `.env` (or create it manually):

```powershell
Copy-Item .env.example .env
```

The frontend uses this environment variable for the backend connection:

```text
VITE_API_BASE_URL=http://localhost:8080
```

The same setting is provided in `frontend/.env.example` for local setup.

Vite reads `VITE_API_BASE_URL` at build time. Set it to the deployed backend URL before running a production build; do not place credentials or other secrets in frontend environment variables because they are bundled into browser assets.

Useful frontend commands:

```powershell
npm run build
npm run preview
```

The production build is generated in `frontend/dist/` and can be served by a static web server. The backend must be running and reachable at the configured API base URL. Deployment automation and server-side frontend hosting configuration are not included yet.

For production frontend builds, copy `frontend/.env.production.example` to an untracked `frontend/.env.production` and set the public backend URL:

```text
VITE_API_BASE_URL=https://api.example.com
```

Vite embeds `VITE_*` values into browser assets. Never put passwords, JWT secrets, database credentials, or private API keys in frontend environment files. Configure backend CORS with the exact frontend origin through `APP_CORS_ALLOWED_ORIGIN`; do not use `*` for a credentialed or private deployment.

## Production prerequisites and secret checks

- Apply and verify all ownership migration scripts before enabling the `prod` profile.
- Use a dedicated MySQL account with only the required database privileges.
- Set a long, random `JWT_SECRET` and rotate it through the deployment secret manager when required.
- Set `DB_PASSWORD` and `APP_CORS_ALLOWED_ORIGIN` outside source control.
- Confirm `.env`, `.env.compose`, `.env.production`, and edited migration templates are ignored locally and are not present in the deployment artifact.
- Serve the frontend and API over HTTPS and configure the production API URL before building the frontend.

## GitHub Actions CI/CD

A production-safe CI workflow is included in `.github/workflows/ci.yml`. It runs on pushes and pull requests and checks:

- backend Maven test suite: `./mvnw clean test`
- frontend production build: `npm ci && npm run build`
- backend Docker build: `docker build -t job-tracker-api .`
- frontend Docker build: `docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t job-tracker-web ./frontend`

Keep all deployment secrets in GitHub repository/environment secrets, never in committed files, and use a private registry or a managed host for published images.

## Deployment preparation

The backend exposes a public readiness endpoint at:

```text
GET /actuator/health
```

It returns `200 OK` when the application and configured database are healthy. Health details are hidden by default. Keep this endpoint available to the load balancer or container orchestrator, but do not expose sensitive management endpoints publicly.

### Docker Compose local production-like stack

Docker Compose is provided for local validation only. It starts MySQL, the backend, and the Nginx-served frontend:

```powershell
Copy-Item .env.compose.example .env.compose
docker compose --env-file .env.compose up --build
```

Open `http://localhost` for the frontend. The backend is available at `http://localhost:8080`, and its health endpoint is `http://localhost:8080/actuator/health`.

The Compose backend deliberately overrides Hibernate schema handling to `update` so a new disposable local MySQL volume can bootstrap. Do not use that override for production. Production must apply the reviewed SQL migrations first and use the `prod` profile with `ddl-auto=validate`.

Stop the local stack with:

```powershell
docker compose --env-file .env.compose down
```

Add `-v` only when intentionally deleting the local MySQL volume and its data.

### Production deployment guidance

Build the backend image with `docker build -t job-tracker-api .` and the frontend image with `docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t job-tracker-web ./frontend`. Supply backend environment variables through the hosting provider's secret manager, run the backend with `SPRING_PROFILES_ACTIVE=prod`, and use a managed MySQL instance or a separately managed database volume.

Put an HTTPS reverse proxy or managed TLS load balancer in front of both services. Route the frontend origin to the static Nginx container and `/api` requests to the backend, or keep the frontend's configured absolute API URL. Set `APP_CORS_ALLOWED_ORIGIN` to the exact HTTPS frontend origin. Do not use wildcard CORS in production.

The frontend `VITE_API_BASE_URL` is compiled into browser assets and is therefore public configuration. It must contain only the API URL; never put database passwords, JWT secrets, or private keys in it. Rotate `JWT_SECRET` and database credentials using the deployment platform rather than editing image layers or checked-in files.
