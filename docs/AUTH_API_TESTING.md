# Supabase Auth API Testing Guide

This guide provides curl examples and testing instructions for all authentication endpoints implemented in the PettyPet API.

## Overview

The authentication system includes the following endpoints:

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/signup` | No | Create new user account |
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/oauth-callback` | No | OAuth provider authentication |
| GET | `/api/auth/user` | Yes | Get current authenticated user |
| POST | `/api/auth/logout` | Yes | Logout and invalidate token |
| POST | `/api/auth/refresh` | No | Refresh expired token |

## Prerequisites

- Development server running: `npm run dev` (http://localhost:3000)
- curl installed (available on macOS, Linux; Windows 10+ via WSL or built-in)
- Postman or similar API client (optional)

## Base URL

```
http://localhost:3000
```

## Response Format

All endpoints return JSON responses in the following format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Endpoints

### 1. POST /api/auth/signup

Create a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Validation:**
- Email must be valid format
- Password must be at least 8 characters
- Name is required
- Email must not already exist

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "auth_provider": "email",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
```

**Test Cases:**
```bash
# Valid signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "ValidPass123",
    "name": "New User"
  }'

# Missing email
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "password": "ValidPass123",
    "name": "New User"
  }'

# Password too short
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "short",
    "name": "User"
  }'

# Invalid email format
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "ValidPass123",
    "name": "User"
  }'
```

---

### 2. POST /api/auth/login

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "auth_provider": "email",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Test Cases:**
```bash
# Valid login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Wrong password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123"
  }'

# Non-existent user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Password123"
  }'

# Missing password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

### 3. POST /api/auth/oauth-callback

Authenticate or create user via OAuth provider (Google, Apple).

**Request Body:**
```json
{
  "provider": "google",
  "providerId": "google-user-id-from-provider",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

**Parameters:**
- `provider`: 'google' or 'apple' (required)
- `providerId`: Unique ID from OAuth provider (required)
- `email`: User email from provider (required)
- `name`: User full name (required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@gmail.com",
      "name": "John Doe",
      "auth_provider": "google",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**cURL Example:**
```bash
# First-time Google OAuth
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "providerId": "google-oauth-id-123",
    "email": "user@gmail.com",
    "name": "John Doe"
  }'

# Apple OAuth
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "apple",
    "providerId": "apple-oauth-id-456",
    "email": "user@icloud.com",
    "name": "Jane Smith"
  }'
```

**Test Cases:**
```bash
# Valid Google OAuth
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "providerId": "google-xyz-123",
    "email": "oauth@gmail.com",
    "name": "OAuth User"
  }'

# Invalid provider
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "facebook",
    "providerId": "fb-123",
    "email": "user@fb.com",
    "name": "FB User"
  }'

# Missing providerId
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "email": "user@gmail.com",
    "name": "John Doe"
  }'

# Invalid email
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "providerId": "google-123",
    "email": "not-an-email",
    "name": "John Doe"
  }'
```

---

### 4. GET /api/auth/user

Retrieve current authenticated user details.

**Required:** Bearer token in Authorization header

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "auth_provider": "email",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**cURL Example:**
```bash
# Replace TOKEN with an actual JWT token from login/signup
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer $TOKEN"
```

**Full Example with Variables:**
```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Use token to get user data
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer $TOKEN"
```

**Test Cases:**
```bash
# Valid authenticated request
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Missing token
curl -X GET http://localhost:3000/api/auth/user

# Invalid token format
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: InvalidToken123"

# Expired/invalid token
curl -X GET http://localhost:3000/api/auth/user \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"
```

---

### 5. POST /api/auth/logout

Logout current user and invalidate token.

**Required:** Bearer token in Authorization header

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out. Please delete the token from your client."
  }
}
```

**Note:** This endpoint verifies the token is valid but doesn't maintain a server-side blacklist for MVP. Production implementation should add token blacklist to database.

**cURL Example:**
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Test Cases:**
```bash
# Valid logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Missing token
curl -X POST http://localhost:3000/api/auth/logout

# Invalid token
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer invalid-token"
```

---

### 6. POST /api/auth/refresh

Refresh expiring or expired JWT token.

**Request:** Provide token via Authorization header or request body

**Request Body (alternative):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Token is invalid or expired. Please login again"
}
```

**cURL Examples:**
```bash
# Via Authorization header
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN"

# Via request body
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Test Cases:**
```bash
# Valid token refresh via header
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Valid token refresh via body
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJhbGciOiJIUzI1NiIs..."}'

# Missing token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer invalid-token"
```

---

## Complete Workflow Example

Here's a complete authentication workflow from signup to getting user data:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# 1. Sign up new user
echo "=== SIGNUP ==="
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "workflow@example.com",
    "password": "WorkflowPass123",
    "name": "Workflow User"
  }')

echo $SIGNUP_RESPONSE | jq '.'
TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 2. Get current user
echo -e "\n=== GET CURRENT USER ==="
curl -s -X GET $BASE_URL/api/auth/user \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Refresh token
echo -e "\n=== REFRESH TOKEN ==="
TOKEN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN")

NEW_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.data.token')
echo "New Token: $NEW_TOKEN"

# 4. Verify new token works
echo -e "\n=== VERIFY NEW TOKEN ==="
curl -s -X GET $BASE_URL/api/auth/user \
  -H "Authorization: Bearer $NEW_TOKEN" | jq '.'

# 5. Logout
echo -e "\n=== LOGOUT ==="
curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $NEW_TOKEN" | jq '.'
```

Save this as `auth-workflow-test.sh`, make executable with `chmod +x auth-workflow-test.sh`, and run with `./auth-workflow-test.sh`.

---

## Testing with Postman

### Import Collection

1. Create new Postman collection: "PettyPet Auth API"
2. Create folder: "Authentication"
3. Add requests with pre-request scripts and tests:

**Pre-request Script (for /api/auth/user, /api/auth/logout requests):**
```javascript
// Use stored token from previous login/signup
if (!pm.environment.get('auth_token')) {
  console.log('No auth token found. Please login first.');
}
```

**Tests (add to login/signup requests to store token):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const responseData = pm.response.json();
  pm.environment.set('auth_token', responseData.data.token);
  console.log('Token saved to environment: ' + responseData.data.token);
}
```

### Request Headers

All protected endpoints require:
```
Authorization: Bearer {{auth_token}}
```

---

## Debugging Tips

### View Full Request/Response

```bash
# Show verbose output with headers
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### Pretty Print JSON Response

```bash
# Using jq (install with: brew install jq)
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' | jq '.'
```

### Decode JWT Token

```bash
# Visit https://jwt.io and paste token, or use jq
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
echo $TOKEN | cut -d'.' -f2 | base64 -D | jq '.'
```

---

## Common Issues

### CORS Errors

If you see CORS errors in browser console:
- Ensure `OPTIONS` request is handled (all endpoints include this)
- Check that `Content-Type: application/json` header is set
- Verify origin is included in `Access-Control-Allow-Origin`

### Token Expired

Tokens expire after 7 days:
- Use `/api/auth/refresh` endpoint to get new token
- Client should handle 401 responses and refresh token automatically

### Email Already Exists

On signup with existing email:
- Check email uniqueness constraint in database
- Response will be 400 with `email already exists` error

### Invalid Request Format

All endpoints expect `Content-Type: application/json`
- Ensure headers include: `-H "Content-Type: application/json"`
- Ensure request body is valid JSON

---

## Next Steps

1. **Implement Email Verification:** Add email confirmation flow
2. **Add Password Reset:** Create password recovery endpoints
3. **Token Blacklist:** Add logout token invalidation to DB
4. **Rate Limiting:** Prevent brute force on login endpoint
5. **MFA:** Add multi-factor authentication support
6. **Session Management:** Track active sessions per user

---

**Created:** 2024-01-15
**Updated:** 2024-01-15
**Version:** 1.0
