# Middleware Hub Architecture

## Purpose

This backend connects a legacy government database to modern departmental portals without writing updated citizen data into the middleware hub.

The legacy database remains the source of truth. When its PostgreSQL trigger detects an insert or update, it publishes a notification. The middleware identifies the citizen, determines the affected service areas, and creates consent-gated tracking work for the relevant departments.

```text
legacy database(s) + PostgreSQL trigger(s)
            |
            | pg_notify on cdc_channel
            v
CDC listener(s) + trusted department_name
            |
            +-----------> identity mapping  --->  rulebook.json
            |                                  |
            v                                  v
        applications  ---------------->  application_tasks
            |
            v
      citizen/dashboard read API
```

## Database boundaries

### Legacy source databases (`legacySources`)

Each source department owns its own legacy database and table, for example:

```text
legacy_users(id, name, address, income, ...)
```

The middleware does not create, change, or store a copy of these tables. Each PostgreSQL trigger publishes a JSON notification containing `operation`, `old_data`, and `new_data` on its configured channel.

For the current `dept_1` source, the citizen identifier in a CDC payload is `new_data.id`. This is configured with `LEGACY_ID_FIELD=id`. The listener adds `department_name: "dept_1"` from trusted source configuration before identity resolution; the payload does not need to be trusted to identify its own department.

### Middleware hub database (`middlewarePool`)

The hub contains identity references and workflow state only. It should not store raw changed values such as a new address, income, or other source PII.

| Table | Purpose |
|---|---|
| `main_global_db` | Maps a departmental legacy identifier to a unified `global_id`. |
| `applications` | Parent tracking and consent record, identified by UARN. |
| `application_tasks` | One queued work item for every target department. |

The expected PostgreSQL definition is in [database/required_schema.sql](database/required_schema.sql). It is a schema contract for an empty hub database, not a migration for an existing populated table.

## Identity mapping model

`main_global_db` supports one citizen having IDs in many departments:

```text
mapping_id | global_id  | department_name | legacy_id
-----------+------------+-----------------+----------
1          | GLOBAL-101 | Transport_Dept  | 12345
2          | GLOBAL-101 | Tax_Dept        | 78901
```

`mapping_id` is the table primary key. The pair `(department_name, legacy_id)` is unique, which means the same legacy ID can safely exist in different departments.

`global_id` is intentionally not unique in this table. Therefore `applications.global_id` is a reference value and does not have a foreign key to `main_global_db.global_id`.

## Application structure

An application is created only after the middleware identifies a recognised change and resolves the citizen identity.

```text
applications
  UARN-... | GLOBAL-101 | Address_Update | PENDING_CONSENT
      |
      +-- application_tasks
            Scholarship_Portal | WAITING
            Hostel_Portal      | WAITING
```

The application holds the overall consent state. Its child tasks independently record the status for each destination department.

## Project layout and ownership

| Location | Responsibility |
|---|---|
| `server.js` | Builds the Express app, mounts routes, starts the API and CDC listener, and performs graceful shutdown. |
| `config/env.js` | Loads `backend/.env` using an absolute path so startup works from either the project root or backend directory. |
| `config/db.js` | Creates the hub pool plus one pool per configured legacy department, and validates their configuration. |
| `config/cdc.js` | Defines source departments, their channels/ID fields, and field-to-event aliases. |
| `services/cdcListener.service.js` | Owns one PostgreSQL `LISTEN` connection per configured source and coordinates each incoming notification. |
| `services/rulebook.service.js` | Loads and validates `rulebook.json`, then supplies target departments for an event. |
| `services/application.service.js` | Generates UARNs and writes an application with all its tasks in one transaction. |
| `controllers/identity.controller.js` | Handles master-data identity-map requests. |
| `controllers/application.controller.js` | Handles pending-application read requests. |
| `routes/` | Declares the public Express paths and delegates to controllers. |
| `middleware/errorHandler.js` | Returns consistent JSON errors for bad routes, validation failures, conflicts, and unexpected errors. |
| `utils/httpError.js` | Provides the shared controlled HTTP error type. |
| `database/required_schema.sql` | Documents and bootstraps the required hub-table structure for an empty database. |

## Main responsibilities

### CDC listener service

`CdcListener` is responsible for the live connection to the legacy PostgreSQL notification channel.

- `start()` opens the listener.
- `connect()` checks out a dedicated source-pool client and runs `LISTEN` on that source's configured channel.
- `onNotification()` queues events in their received order.
- `processNotification()` validates the payload, attaches its configured `department_name`, finds the relevant event type, resolves identity, obtains rulebook targets, and begins application creation.
- `handleDisconnect()` and `scheduleReconnect()` release a failed listener client and reconnect with capped backoff.
- `stop()` unregisters the channel during graceful shutdown.

Supporting functions in the same service have focused responsibilities:

- `parseNotificationPayload()` validates JSON notification content and attaches the trusted listener department.
- `changedFields()` compares `old_data` with `new_data`.
- `deriveTriggerEvents()` translates recognised changed fields into events such as `Address_Update`.
- `extractLegacyId()` gets the source-system ID using the source-specific ID-field configuration.
- `resolveGlobalId()` reads the citizen's `global_id` using both `department_name` and `legacy_id`.

### Rulebook service

`RulebookService` reads `rulebook.json` once at startup and validates that every event has at least one target department.

`getTargets(triggerEvent)` returns the department list for an event, for example the portals that must receive an address-update task.

### Application service

`generateUarn()` creates a unique tracking-number candidate using the current time and a cryptographically random UUID component.

`createApplicationWithTasks()` owns the all-or-nothing workflow write:

1. Insert the parent `applications` row with `PENDING_CONSENT`.
2. Insert one `application_tasks` row per rulebook target with `WAITING`.
3. Commit only when all inserts succeed; otherwise roll back the complete unit of work.

### HTTP controllers and routes

| Endpoint | Route | Controller responsibility |
|---|---|---|
| Add or update a citizen's departmental ID | `POST /api/mdm/identity` | `upsertIdentity()` validates `department_name`, `legacy_id`, and `global_id`, then writes the mapping into `main_global_db`. |
| Read pending work | `GET /api/applications/pending/:global_id` | `getPendingApplications()` returns pending UARNs and their departmental tasks for one citizen. |
| Health response | `GET /` | Confirms that the HTTP application is running. |

## Configuration

The service reads configuration from `backend/.env`. Important variables are:

| Variable | Purpose |
|---|---|
| `LEGACY_DEPARTMENTS` | Comma-separated source departments; defaults to `dept_1`. |
| `LEGACY_DATABASE_URL` | Compatibility connection URL for the default `dept_1` source. |
| `LEGACY_<DEPARTMENT>_DATABASE_URL` | Required connection URL for each additional source, for example `LEGACY_TRANSPORT_DEPT_DATABASE_URL`. |
| `LEGACY_<DEPARTMENT>_CDC_CHANNEL` | Optional source-specific PostgreSQL channel override. |
| `LEGACY_<DEPARTMENT>_ID_FIELD` | Optional source-specific payload ID-field override. |
| `MIDDLEWARE_DATABASE_URL` | Connection URL for the middleware hub. |
| `PORT` | Express server port; defaults to `3000`. |
| `CDC_CHANNEL` | PostgreSQL notification channel; defaults to `cdc_channel`. |
| `LEGACY_ID_FIELD` | Field in `old_data`/`new_data` holding the source ID; `id` for `legacy_users`. |
| `DB_SSL` | Explicit SSL enable/disable setting where required. |
| `DB_POOL_MAX` | Maximum clients for each PostgreSQL pool. |

Secrets remain in `.env` and must not be committed to Git.

## Current integration status

The backend supports multiple configured source departments. At startup it creates one pool and one CDC listener per entry in `LEGACY_DEPARTMENTS`. Every listener attaches its configured department name and resolves identity with the composite `(department_name, legacy_id)` key. The MDM API also writes mappings with that same composite key.

The default configuration remains one source, `dept_1`, so the existing deployment continues to work. To add a department, add its name to `LEGACY_DEPARTMENTS` and supply its `LEGACY_<DEPARTMENT>_DATABASE_URL`; the server will create its listener on the next restart.

## Operational notes

- The server does not start without both database URLs.
- CDC listener failures retry without taking down the HTTP API.
- A malformed notification or unmapped identity is logged and skipped rather than stopping later events.
- PostgreSQL `LISTEN/NOTIFY` is not a durable queue. Notifications sent while the listener is disconnected cannot be replayed. A later production enhancement should use a durable outbox/event identifier for recovery and idempotency.
