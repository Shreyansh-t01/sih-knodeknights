-- Middleware database schema contract
--
-- This file documents the required middleware-hub tables and columns.
-- It is safe to run against an EMPTY middleware database. CREATE TABLE IF NOT
-- EXISTS does not modify a table that you have already created manually.
-- Review any differences with your existing schema before applying migrations.

BEGIN;

-- FEDERATED IDENTITY MAP
-- No source-system PII is stored here. A citizen can have many departmental
-- mappings. legacy_id therefore is unique only inside its department.
CREATE TABLE IF NOT EXISTS main_global_db (
  mapping_id SERIAL PRIMARY KEY,
  global_id VARCHAR NOT NULL,
  department_name VARCHAR NOT NULL,
  legacy_id VARCHAR NOT NULL,
  CONSTRAINT main_global_db_department_legacy_key
    UNIQUE (department_name, legacy_id)
);

-- Supports looking up every departmental mapping for a unified citizen.
CREATE INDEX IF NOT EXISTS main_global_db_global_id_idx
  ON main_global_db (global_id);

-- PARENT CONSENT/TRACKING RECORD
CREATE TABLE IF NOT EXISTS applications (
  uarn VARCHAR PRIMARY KEY,
  global_id VARCHAR NOT NULL,
  trigger_event VARCHAR NOT NULL,
  overall_status VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- applications.global_id deliberately has no foreign key to main_global_db:
-- global_id is not unique in a one-citizen-to-many-mappings identity table.

-- CHILD DEPARTMENTAL WORK QUEUE
CREATE TABLE IF NOT EXISTS application_tasks (
  task_id SERIAL PRIMARY KEY,
  uarn VARCHAR NOT NULL,
  target_department VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT application_tasks_uarn_fk
    FOREIGN KEY (uarn) REFERENCES applications (uarn) ON DELETE CASCADE
);

-- Supports GET /api/applications/pending/:global_id efficiently.
CREATE INDEX IF NOT EXISTS applications_pending_by_global_id_idx
  ON applications (global_id, created_at DESC)
  WHERE overall_status = 'PENDING_CONSENT';

-- Supports application-to-task joins and foreign-key validation.
CREATE INDEX IF NOT EXISTS application_tasks_by_uarn_idx
  ON application_tasks (uarn);

COMMIT;

-- SOURCE DATABASE REQUIREMENT (legacyPool; DOCUMENTATION ONLY)
-- The Node.js service does not create or alter legacy_users. It only listens to
-- PostgreSQL notifications from the trigger already attached to it.
--
-- Expected source table shape:
--   legacy_users(id PRIMARY KEY, name, address, income, ...)
--
-- Set LEGACY_ID_FIELD=id in backend/.env for this source schema. The runtime
-- listener adds department_name from trusted LEGACY_DEPARTMENTS configuration
-- before resolving the composite mapping. Each trigger payload must include
-- new_data.id (and old_data.id for UPDATE records), e.g.:
-- {
--   "operation": "UPDATE",
--   "old_data": { "id": 101, "address": "Old address" },
--   "new_data": { "id": 101, "address": "New address" }
-- }
