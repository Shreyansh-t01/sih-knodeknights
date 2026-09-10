# Change 2: Department-aware CDC and identity mapping

## Summary

The backend now supports multiple legacy source departments. Each source gets its own PostgreSQL pool and CDC listener, and every event is labelled with a trusted `department_name` before the citizen identity is resolved.

The default source remains `dept_1`, so the current single-department deployment continues to use `LEGACY_DATABASE_URL` and `LEGACY_ID_FIELD=id`.

## Changed files

| File | Change | Why |
|---|---|---|
| `config/cdc.js` | Added `LEGACY_DEPARTMENTS` parsing and per-department URL, channel, and ID-field configuration. | Allows a new department to be added through environment configuration instead of changing source code. |
| `config/db.js` | Replaced the single legacy-pool setup with `legacySources`: one configuration and `pg.Pool` for each department. | Independent databases require independent database connections. `legacyPool` remains as a compatibility export for the first source. |
| `.env` | Set `LEGACY_ID_FIELD=id` for the current `legacy_users` source. | The source table identifies records with its `id` primary-key field; this setting must not override that with the old `legacy_id` name. |
| `services/cdcListener.service.js` | Made `CdcListener` source-specific; it receives a pool, department, channel, and ID field. Parsed payloads are enriched with the configured department, and mapping lookup now uses both department and legacy ID. | A legacy ID is only meaningful within its source department. Using the composite key prevents cross-department identity collisions. |
| `controllers/identity.controller.js` and `routes/mdm.routes.js` | `POST /api/mdm/identity` accepts a validated `department_name`, `legacy_id`, and `global_id`, then writes the composite mapping. | Lets a citizen add each additional departmental legacy ID to their unified identity without duplicate department/ID pairs. |
| `server.js` | Creates, starts, stops, and closes one CDC listener/pool for every configured source department. | Ensures all configured legacy databases are listened to and shut down cleanly. |
| `test/cdcListener.service.test.js` | Added tests proving that trusted department configuration overrides a payload value and that identity lookup uses both department and legacy ID. | Verifies the multi-department boundary and prevents a regression to legacy-ID-only lookup. |
| `database/required_schema.sql` | Updated source comments to state that the runtime listener supplies the trusted department name. | Keeps the schema contract aligned with the running architecture. |
| `ARCHITECTURE.md` | Updated the architecture, module ownership, source configuration, and current status for multiple departments. | Keeps the primary architecture document accurate. |
| `IMPLEMENTATION.md` | Updated setup, CDC contract, MDM example, and schema references for department-aware mappings. | Keeps implementation and API documentation accurate. |

## Configuration

### Current single-source deployment

```env
LEGACY_DEPARTMENTS=dept_1
LEGACY_DATABASE_URL=postgresql://...
LEGACY_ID_FIELD=id
MIDDLEWARE_DATABASE_URL=postgresql://...
```

### Adding another department

```env
LEGACY_DEPARTMENTS=dept_1,transport_dept,tax_dept

LEGACY_DATABASE_URL=postgresql://...                 # dept_1 compatibility URL
LEGACY_TRANSPORT_DEPT_DATABASE_URL=postgresql://...
LEGACY_TAX_DEPT_DATABASE_URL=postgresql://...

# Optional when a source differs from the defaults
LEGACY_TRANSPORT_DEPT_CDC_CHANNEL=cdc_channel
LEGACY_TRANSPORT_DEPT_ID_FIELD=id
```

Department names may use letters, numbers, `_`, and `-`. Their environment-variable form is uppercase with hyphens converted to underscores. For example, `transport-dept` uses `LEGACY_TRANSPORT_DEPT_DATABASE_URL`.

## API change

`POST /api/mdm/identity` now requires all three fields:

```json
{
  "department_name": "dept_1",
  "legacy_id": "101",
  "global_id": "GLOBAL-101"
}
```

The endpoint inserts a new row when the department/legacy-ID pair is new. It updates a mapping only when both `department_name` and `legacy_id` already match.

## CDC payload enrichment

The source trigger can continue publishing its normal event payload:

```json
{
  "operation": "UPDATE",
  "old_data": { "id": 101, "address": "Old address" },
  "new_data": { "id": 101, "address": "New address" }
}
```

The listener for `dept_1` enriches the in-memory payload before processing it:

```json
{
  "department_name": "dept_1"
}
```

The department value comes from server configuration, not the notification body, so another source cannot claim to be a different department by changing payload JSON.
