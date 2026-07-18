# AyuNet API Development Guidelines

This document outlines the coding standards, response payloads, and design patterns for building and consuming APIs on AyuNet.

---

## 🚀 Protocols and Formatting

- **Format**: All REST API endpoints must consume and return JSON payloads.
- **Root Prefix**: All endpoints must reside under `/api/v1/` or the configured global route prefixes.
- **Naming Conventions**:
  - URLs: lowercase with hyphens (e.g. `/api/v1/patient-records`).
  - JSON keys: camelCase (e.g. `patientId`, `consultationDate`).

---

## 🛰️ HTTP Verb Conventions

| Verb | Path | Action | Success Status |
| :--- | :--- | :--- | :--- |
| **GET** | `/patients` | List patients | `200 OK` |
| **GET** | `/patients/:id` | Get patient by ID | `200 OK` |
| **POST** | `/patients` | Create new patient | `201 Created` |
| **PUT** | `/patients/:id` | Replace patient details | `200 OK` |
| **PATCH** | `/patients/:id` | Partial update of patient details | `200 OK` |
| **DELETE** | `/patients/:id` | Inactivate/delete patient | `200 OK` or `204 No Content` |

---

## 📦 Standard Response Structs

To ensure frontend consumption is predictable, NestJS APIs should wrap outputs using consistent patterns.

### 1. Success Payload
```json
{
  "success": true,
  "data": {
    "id": "usr_91283",
    "name": "Jane Doe",
    "role": "PATIENT"
  },
  "meta": {
    "timestamp": "2026-07-18T17:08:00Z"
  }
}
```

### 2. Paginated Success Payload
```json
{
  "success": true,
  "data": [
    { "id": "apt_1", "status": "COMPLETED" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "timestamp": "2026-07-18T17:08:00Z"
  }
}
```

### 3. Error Payload (HTTP Exceptions)
Follow NestJS standard error handling, customized to return:
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request",
  "timestamp": "2026-07-18T17:08:05Z",
  "path": "/api/v1/auth/register"
}
```
Use NestJS global filters `HttpExceptionFilter` to enforce this structure across all services.
