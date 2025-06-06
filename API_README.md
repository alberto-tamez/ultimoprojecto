# API Documentation

This document provides detailed information about the available API endpoints, their request/response formats, and usage examples.

## Base URL

All API endpoints are relative to the base URL of the server (e.g., `http://localhost:8000`).

## Authentication

Most endpoints require authentication. The API uses WorkOS for authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Table of Contents

1. [Users](#users)
   - [Create User](#create-user)
   - [Get Current User](#get-current-user)
2. [Prediction History](#prediction-history)
   - [Get Prediction History](#get-prediction-history)
3. [Logs](#logs)
   - [Get Logs](#get-logs)
   - [Create Log](#create-log)

---

## Users

### Create User

Creates a new user in the system.

**Endpoint:** `POST /users/`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "google_id": "optional_google_id"
}
```

**Parameters:**
- `email` (string, required): User's email address (must be unique)
- `name` (string, required): User's full name
- `role` (string, required): User's role (e.g., 'user', 'admin')
- `google_id` (string, optional): Google OAuth ID if using Google authentication

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "google_id": null,
  "created_at": "2023-01-01T00:00:00"
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered
- `422 Unprocessable Entity`: Validation error in request body

### Get Current User

Retrieves the currently authenticated user's information.

**Endpoint:** `GET /users/me/`

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "google_id": null,
  "created_at": "2023-01-01T00:00:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token

---

## Prediction History

### Get Prediction History

Retrieves the prediction history for the currently authenticated user.

**Endpoint:** `GET /history/`

**Query Parameters:**
- None

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "timestamp": "2023-01-01T12:00:00",
    "result": "maize",
    "filename": "field_2023.jpg"
  },
  {
    "id": 2,
    "user_id": 1,
    "timestamp": "2023-01-02T14:30:00",
    "result": "wheat",
    "filename": "field_2024.jpg"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token

---

## Logs

### Get Logs

Retrieves a paginated list of system logs (admin only).

**Endpoint:** `GET /logs/`

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (for pagination)
- `limit` (integer, optional): Maximum number of records to return (default: 100, max: 1000)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "type": "prediction",
    "input_data": {"key": "value"},
    "output_result": {"key": "value"},
    "created_at": "2023-01-01T12:00:00"
  }
]
```

### Create Log

Creates a new system log entry.

**Endpoint:** `POST /logs/`

**Request Body:**
```json
{
  "type": "prediction",
  "input_data": {"key": "value"},
  "output_result": {"key": "value"}
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "type": "prediction",
  "input_data": {"key": "value"},
  "output_result": {"key": "value"},
  "created_at": "2023-01-01T12:00:00"
}
```

---

## Error Responses

### Standard Error Response

```json
{
  "detail": "Error message describing the issue"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request format or parameters
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error in request body
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are subject to rate limiting. The current limits are:
- 1000 requests per hour per IP address
- 100 requests per minute per authenticated user

## Versioning

API versioning is handled through the URL path (e.g., `/v1/...`). The current API version is `v1`.

## Changelog

### v1.0.0 (2023-01-01)
- Initial API release
- User management endpoints
- Prediction history tracking
- System logging
