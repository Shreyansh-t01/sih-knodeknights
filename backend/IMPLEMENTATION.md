# Middleware CDC backend implementation

## What changed

The former backend was a prototype: it created one `pg.Client` for each database, embedded database credentials in `db.js`, started a listener from an incorrect export, and exposed a route that interpolated request data into `ALTER TABLE` SQL. That implementation has been replaced with the following production-oriented structure:

```text
backend/
  config/                 database pools and CDC configuration
  services/               rulebook, CDC, and transaction orchestration
  controllers/            HTTP request handling
  routes/                 API route declarations
  middleware/             JSON 404/error responses
  utils/                  shared HTTP error type
  rulebook.json           event-to-department policy
  server.js               application composition and lifecycle
```

The retired `db.js`, `Controllers/cdc_listener.js`, and `routes/citizenRoutes.js` were removed. They are superseded by the modules above; removing them also removes the dynamic-SQL endpoint and the hard-coded credentials. If the exposed legacy connection strings were ever used, rotate those credentials immediately.

## Database configuration

`config/db.js` exports independent `pg.Pool` instances:

- One source pool is created for each configured legacy department and is used only for that department's dedicated `LISTEN` connection.
- `middlewarePool` is used for identity lookups, API reads, and transactions.

Set `MIDDLEWARE_DATABASE_URL` and `LEGACY_DATABASE_URL` in `backend/.env`. The server refuses to start without both for the default `dept_1` source. Additional department URLs are configured as `LEGACY_<DEPARTMENT>_DATABASE_URL`. Pool size, connection timeout, idle timeout, SSL, port, PostgreSQL channel, and source identity field are configurable from environment variables. No secrets are present in source code.

The application explicitly loads `backend/.env` through `dotenv`, using an absolute path relative to the backend folder. It therefore works whether it is launched with `cd backend && node server.js` or `node backend/server.js` from the repository root. Shell/host environment variables take precedence over `.env`; set `DOTENV_CONFIG_PATH` only when an intentionally different environment file is required.

Run the service with:

```bash
cd backend
node server.js
```

`npm.cmd run start` can be used in Windows environments where PowerShell execution policy blocks `npm.ps1`.

## CDC contract and data diffing

On startup, `services/cdcListener.service.js` creates one listener per department in `LEGACY_DEPARTMENTS`. Each listener checks out one client from its department's pool and runs `LISTEN` on the source-specific channel (or `CDC_CHANNEL`). It serializes notification handling to preserve notification order. A broken listener connection is released and retried with capped exponential backoff; a malformed notification is logged without stopping subsequent notifications.

For an update, the trigger must publish both values so the service can calculate a field-level diff safely:

```json
{
  "operation": "UPDATE",
  "old_data": { "id": "LEG-1001", "address": "Old address" },
  "new_data": { "id": "LEG-1001", "address": "New address" }
}
```

The diff maps known field names to your existing rulebook events, for example `address` to `Address_Update`, `date_of_birth` to `Date_of_Birth_Update`, and `mobile_number` to `Mobile_Number_Update`. The complete mapping is in `config/cdc.js`; add aliases there when legacy column names differ. Multiple changed event categories deliberately produce independent applications, since they can have distinct consent and routing lifecycles.

For inserts, every recognised field present in `new_data` is considered new. If the existing trigger can only publish `new_data` for updates, it must be changed to include `old_data`; treating all fields as changed on an update would create incorrect downstream work. A temporary explicit fallback is supported through `changed_fields` or `trigger_event`, but full old/new data is the normal contract.

The listener attaches its trusted configured `department_name` to the parsed payload. The identity is read from `new_data[LEGACY_ID_FIELD]` (default `id` for `legacy_users`) and resolved using the composite `department_name` and `legacy_id` key in `main_global_db`. No map means no application is created, which prevents updates being assigned to the wrong citizen.

## Rulebook and transaction flow

The existing `rulebook.json` is loaded and validated at startup. It supports the current form:

```json
{ "Address_Update": { "target_departments": ["Scholarship_Portal"] } }
```

After a known event, valid identity, and non-empty target list are resolved, one random UUID-backed UARN is generated. `services/application.service.js` then performs this all-or-nothing unit of work using one checked-out middleware client:

```text
BEGIN
  insert applications (..., PENDING_CONSENT)
  insert one application_tasks row per target (..., WAITING)
COMMIT
```

Any error leads to `ROLLBACK`; the client is always released. Thus no application can be committed without its associated departmental tasks. Add a database `UNIQUE` constraint on `applications.uarn` so the database formally enforces the UARN uniqueness guarantee.

## HTTP API

### Add a citizen's departmental legacy ID

`POST /api/mdm/identity`

```json
{ "department_name": "dept_1", "legacy_id": "LEG-1001", "global_id": "GLOBAL-7f1c" }
```

This is an atomic upsert and returns the mapping. It requires `UNIQUE (department_name, legacy_id)` on `main_global_db`.

Each new `(department_name, legacy_id)` pair creates another mapping row for the supplied citizen `global_id`. If that exact pair already exists, its `global_id` is updated instead of creating a duplicate row.

### Read pending work for a citizen

`GET /api/applications/pending/:global_id`

The endpoint returns only applications with `overall_status = PENDING_CONSENT`, each with its `WAITING` or other task rows. It uses a parameterized join and returns an empty `applications` array when the citizen has no pending work.

All validation, database, unknown-route, and unexpected errors are converted into JSON responses. Database error details are not returned to callers.

## Required schema guarantees

The named tables already exist, but the following constraints and indexes are required for correct and efficient operation. Review the types against your existing schema before applying them:

```sql
ALTER TABLE main_global_db
  ADD CONSTRAINT main_global_db_department_legacy_key
  UNIQUE (department_name, legacy_id);

ALTER TABLE applications
  ADD CONSTRAINT applications_uarn_key UNIQUE (uarn);

ALTER TABLE application_tasks
  ADD CONSTRAINT application_tasks_uarn_fk
  FOREIGN KEY (uarn) REFERENCES applications (uarn) ON DELETE CASCADE;

CREATE INDEX applications_pending_by_global_id_idx
  ON applications (global_id, created_at DESC)
  WHERE overall_status = 'PENDING_CONSENT';

CREATE INDEX application_tasks_by_uarn_idx ON application_tasks (uarn);
```

The API assumes these columns: `main_global_db(mapping_id, department_name, legacy_id, global_id)`, `applications(uarn, global_id, trigger_event, overall_status, created_at)`, and `application_tasks(task_id, uarn, target_department, status, updated_at)`.

## Operational limits and next production steps

PostgreSQL `NOTIFY` messages are not durable: a listener that is disconnected does not receive past notifications, and notifications do not themselves provide exactly-once delivery. The reconnect logic avoids an API outage but cannot recover missed source changes. For a legally significant government workflow, persist an outbox/event ID in the legacy transaction and consume it with a durable cursor or CDC tool; store that source event ID under a unique constraint in the hub for idempotency.

Protect the MDM route with authentication and authorization before exposure, restrict the legacy database account to `CONNECT` and whatever permissions are required for `LISTEN`, and restrict the hub account to the listed tables. Use TLS with certificate verification in production, structured/redacted logs, secrets management, monitoring for unmapped identities and listener reconnection, and integration tests against an isolated PostgreSQL instance.
