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

## Authentication (WorkOS)

Your backend delegates authentication to WorkOS. The authentication flow is as follows:

### 1. Initiate Login
**GET /api/auth/login**
- Returns a WorkOS authorization URL for the frontend to redirect the user to.
- Example response:
```json
{"authorization_url": "https://api.workos.com/user_management/authorize?..."}
```

### 2. Authentication Callback
**GET /api/auth/callback?code=...**
- Handles the callback from WorkOS after the user authenticates.
- Provisions the user in your database (Just-In-Time), sets a secure session cookie, and redirects to your dashboard.
- No JSON response; this is a redirect endpoint.

### 3. Logout
**POST /api/auth/logout**
- Clears the session cookie and returns a WorkOS logout URL for the frontend to redirect the user to.
- Example response:
```json
{"logout_url": "https://api.workos.com/user_management/sessions/logout?..."}
```

### Session Management
- Session is managed via HTTP-only cookies set by the backend after successful authentication.
- All protected endpoints require a valid session.

---

## Users

### Get Current User
Returns the current authenticated user's details. Requires a valid session.
- **GET /users/me/**
- Response: UserInDB schema

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


=== flow that should work
Excellent. You've provided a clear summary of your frontend's authentication workflow. This is a standard and robust setup, likely using a framework like Next.js with its server-side capabilities.

Let's, as Dr. Coddstone, map each step of your frontend workflow to its corresponding interaction with the backend API. This defines the contract between your two services.

### How Your Frontend Workflow Interacts with the Backend API

Here is the step-by-step "story" of the data flow between your frontend and backend:

**Scene 1: User Initiates Login**

1.  **Frontend (`/login` page):** A user clicks the "Sign in with WorkOS" button.
2.  **Frontend (`useAuthFlow` hook):** This hook triggers the function `apiClient.initiateLogin()`.
3.  **API Call to Backend:** `apiClient.initiateLogin()` makes a network request to your backend:
    * **`GET /api/auth/login`**
4.  **Backend Responds:** Your backend receives this request, calls the WorkOS SDK to generate the unique authorization URL, and sends it back to the frontend:
    * **Response:** A JSON object like `{ "authorization_url": "https://api.workos.com/user_management/authorize?..." }`
5.  **Frontend Redirects:** The frontend receives this URL and immediately performs a full-page redirect, sending the user's browser to the WorkOS login page.

**Scene 2: WorkOS Authentication & Callback**

1.  **User at WorkOS:** The user authenticates successfully on the WorkOS hosted UI.
2.  **WorkOS Redirects Browser:** WorkOS redirects the user's browser back to the Redirect URI you configured. Based on your file path (`/app/callback/route.ts`), this is a server-side route in your frontend application. Let's say the URL is `https://your-app.com/callback?code=...`
3.  **Frontend Server-Side Route (`handleAuth`):** Your Next.js/frontend server receives this incoming request. It extracts the `code` from the URL query parameters.
4.  **API Call to Backend:** This server-side route handler **must** now communicate with your main backend to securely exchange the code for tokens. It makes a server-to-server API call:
    * **`POST /api/auth/callback`**
    * **Request Body:** `{ "code": "the_auth_code_from_workos" }`
5.  **Backend Responds with Session:** Your main backend handles the secure exchange with WorkOS, creates/updates the user in your database, stores the refresh token, and then responds to your frontend server. The response includes a `Set-Cookie` header to establish the session:
    * **Response:** `200 OK` (with the `Set-Cookie` header containing the http-only session cookie).
6.  **Frontend Redirects:** Your `/callback` route handler receives the successful `200 OK` from the backend, knows the session cookie has been set, and then performs a browser redirect to the destination page (e.g., `/` or `/dashboard`).

**Scene 3: Accessing a Protected Page**

1.  **Frontend:** The user, now logged in, navigates to a protected page like `/profile`.
2.  **Frontend (`authkitMiddleware`):** Your middleware intercepts this request. The browser automatically sends the http-only session cookie with the request. The middleware needs to verify if this session is valid.
3.  **API Call to Backend:** The middleware makes a request to your backend to validate the session and get user info:
    * **`GET /api/auth/me`**
4.  **Backend Responds:** Your backend receives the request (with the cookie), validates the access token (refreshing it if necessary), finds the user in your database, and sends back the user's profile:
    * **Response:** `200 OK` with JSON `{ "id": 1, "email": "...", "name": "..." }` or `401 Unauthorized` if the session is invalid and cannot be refreshed.
5.  **Frontend Middleware Acts:** Based on the backend's response:
    * If `200 OK`, it allows the user to access the `/profile` page.
    * If `401 Unauthorized`, it redirects the user to `/login`.

**Scene 4: User Logs Out**

1.  **Frontend:** User clicks "Logout."
2.  **API Call to Backend:** The frontend calls your backend's logout endpoint:
    * **`POST /api/auth/logout`**
3.  **Backend Responds:** Your backend invalidates the session on its side (deletes the refresh token from the database), clears the session cookie (by sending back a `Set-Cookie` header with an expired date), and provides the WorkOS global logout URL:
    * **Response:** `200 OK` with JSON `{ "workos_logout_url": "https://api.workos.com/user_management/sessions/logout?..." }`
4.  **Frontend Redirects:** The frontend receives this response and performs a final browser redirect to the `workos_logout_url` to complete the process.

This flow correctly separates responsibilities: the **frontend** manages the user interface and state, while the **backend** handles all secure operations, token exchanges, and serves as the ultimate authority on whether a user's session is valid.