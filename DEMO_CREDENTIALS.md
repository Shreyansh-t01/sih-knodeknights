# MahaSetu Federated SSO & RBAC Demo Credentials

This document provides the official test identities, credentials, and role boundaries for the **MahaSetu** Smart India Hackathon (SIH 2026) prototype.

---

## 1. Citizens (Live Neon Database Linked)

| Name | Unified Citizen ID (`UID`) | Security PIN | Location | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Smt. Ananya Deshmukh** | `GLOBAL-MMVY-00010001` | `123456` | Pune | Citizen consent review, application tracking |
| **Shri Rahul Patil** | `GLOBAL-MMVY-00010002` | `123456` | Nashik | Citizen consent review, application tracking |
| **Kum. Sunita Jadhav** | `GLOBAL-MMVY-00010003` | `123456` | Nagpur | Citizen consent review, application tracking |

> **Note**: Citizen data is fetched in real-time on demand from the MMVY Neon PostgreSQL database via API Setu without storing citizen PII permanently in MahaSetu.

---

## 2. Department Verification Officers (Strict RBAC Scoped)

| Name | Official Email / Officer ID | Security Password | Department Scope | Access Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| **Shri Rajesh Patil** | `rajesh.patil@revenue.maharashtra.gov.in` | `MahaSetu@2026` | `Revenue_Department` | Authorized for Revenue tasks only; blocked by RBAC middleware from Police tasks. |
| **Insp. Vikram Shinde** | `vikram.shinde@mahapolice.gov.in` | `MahaSetu@2026` | `Police_Department` | Scoped strictly to Police background verification; blocked from Revenue tasks. |

---

## 3. Platform Administrators & State Auditors

| Name | Official Email / ID | Security Password | Assigned Role | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Smt. Neha Sharma** | `neha.sharma@mahasetu.gov.in` | `MahaSetu@2026` | `MAHASETU_ADMIN` | Full control plane (MDM mappings, connectors, workflow monitors, failure recovery). |
| **Shri Amitabh Roy** | `amitabh.roy@cag.gov.in` | `MahaSetu@2026` | `AUDITOR` | Read-only oversight across all immutable audit trails and system performance metrics. |

---

## 4. Configuration File Locations

- Backend Auth Credentials: [`backend/config/demoCredentials.json`](backend/config/demoCredentials.json)
- Frontend Credential Manifest: [`frontend/src/config/demoCredentials.js`](frontend/src/config/demoCredentials.js)
