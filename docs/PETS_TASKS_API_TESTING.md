# Pet and Care Task APIs - Testing Guide

Complete testing guide for the PettyPet pet management and care task tracking APIs.

## Overview

The pet and task management system includes the following endpoints:

### Pets API

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/pets` | ✅ Yes | Create new pet |
| GET | `/api/pets` | ✅ Yes | List all user's pets |
| GET | `/api/pets/:id` | ✅ Yes | Get single pet |
| PUT | `/api/pets/:id` | ✅ Yes | Update pet |
| DELETE | `/api/pets/:id` | ✅ Yes | Delete pet |

### Tasks API

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/tasks` | ✅ Yes | Create new task |
| GET | `/api/tasks?petId=...` | ✅ Yes | List tasks for pet |
| PUT | `/api/tasks/:id` | ✅ Yes | Update task |
| POST | `/api/tasks/:id/complete` | ✅ Yes | Mark task complete |
| DELETE | `/api/tasks/:id` | ✅ Yes | Delete task |

## Prerequisites

- Development server running: `npm run dev` (http://localhost:3000)
- Valid JWT token from `/api/auth/login` or `/api/auth/signup`
- curl or Postman installed

## Setup - Get Authentication Token

```bash
# First, create an account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }' | jq -r '.data.token'

# Or login if account exists
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

Use this token for all authenticated requests:
```bash
-H "Authorization: Bearer $TOKEN"
```

---

## PETS API

### 1. POST /api/pets - Create Pet

Create a new pet for the authenticated user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Buddy",
    "type": "dog",
    "breed": "Golden Retriever",
    "gender": "male",
    "dateOfBirth": "2023-06-15"
  }'
```

**Request Body:**
```json
{
  "name": "string (required, 1-100 chars)",
  "type": "string (required, 1-50 chars, e.g. dog, cat, rabbit)",
  "breed": "string (required, 1-100 chars)",
  "gender": "male | female | other (required)",
  "dateOfBirth": "YYYY-MM-DD or ISO datetime (required)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-id-uuid",
    "name": "Buddy",
    "type": "dog",
    "breed": "Golden Retriever",
    "gender": "male",
    "dateOfBirth": "2023-06-15",
    "createdAt": "2026-04-14T10:30:00Z"
  }
}
```

**Test Variations:**
```bash
# Valid creation
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Whiskers","type":"cat","breed":"Siamese","gender":"female","dateOfBirth":"2022-03-20"}'

# Missing required field (should fail)
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Hoppy","type":"rabbit","breed":"Holland Lop","dateOfBirth":"2023-01-10"}'

# Invalid gender (should fail)
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Rocky","type":"dog","breed":"Labrador","gender":"unknown","dateOfBirth":"2023-05-30"}'

# Invalid date format (should fail)
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Rex","type":"dog","breed":"German Shepherd","gender":"male","dateOfBirth":"06/15/2023"}'
```

---

### 2. GET /api/pets - List All Pets

Get all pets belonging to the authenticated user.

**Request:**
```bash
curl -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-id-uuid",
      "name": "Buddy",
      "type": "dog",
      "breed": "Golden Retriever",
      "gender": "male",
      "dateOfBirth": "2023-06-15",
      "createdAt": "2026-04-14T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "user-id-uuid",
      "name": "Whiskers",
      "type": "cat",
      "breed": "Siamese",
      "gender": "female",
      "dateOfBirth": "2022-03-20",
      "createdAt": "2026-04-14T10:31:00Z"
    }
  ]
}
```

**Test Cases:**
```bash
# List all pets (requires auth)
curl -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Without auth token (should fail with 401)
curl -X GET http://localhost:3000/api/pets

# With invalid token (should fail with 401)
curl -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer invalid_token_here"
```

---

### 3. GET /api/pets/:id - Get Single Pet

Get details of a specific pet by ID.

**Request:**
```bash
PET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-id-uuid",
    "name": "Buddy",
    "type": "dog",
    "breed": "Golden Retriever",
    "gender": "male",
    "dateOfBirth": "2023-06-15",
    "createdAt": "2026-04-14T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Pet not found"
}
```

**Test Cases:**
```bash
# Get existing pet
PET_ID=$(curl -s -X GET http://localhost:3000/api/pets \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

curl -X GET http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN"

# Get non-existent pet (should fail)
curl -X GET http://localhost:3000/api/pets/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"

# Try to access another user's pet (should fail with 403)
# Set TOKEN2 to another user's token
curl -X GET http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN2"
```

---

### 4. PUT /api/pets/:id - Update Pet

Update specific fields of a pet.

**Request:**
```bash
PET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X PUT http://localhost:3000/api/pets/$PET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Buddy Jr.",
    "gender": "male"
  }'
```

**Request Body (all optional):**
```json
{
  "name": "string (1-100 chars)",
  "type": "string (1-50 chars)",
  "breed": "string (1-100 chars)",
  "gender": "male | female | other",
  "dateOfBirth": "YYYY-MM-DD or ISO datetime"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-id-uuid",
    "name": "Buddy Jr.",
    "type": "dog",
    "breed": "Golden Retriever",
    "gender": "male",
    "dateOfBirth": "2023-06-15",
    "createdAt": "2026-04-14T10:30:00Z"
  }
}
```

**Test Cases:**
```bash
# Update only name
curl -X PUT http://localhost:3000/api/pets/$PET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Max"}'

# Update multiple fields
curl -X PUT http://localhost:3000/api/pets/$PET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Fluffy","breed":"Persian"}'

# Update with invalid data (should fail)
curl -X PUT http://localhost:3000/api/pets/$PET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"gender": "invalid"}'
```

---

### 5. DELETE /api/pets/:id - Delete Pet

Delete a pet permanently.

**Request:**
```bash
PET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X DELETE http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Pet deleted successfully"
  }
}
```

**Error Response (403 - Forbidden):**
```json
{
  "success": false,
  "error": "Forbidden"
}
```

**Test Cases:**
```bash
# Delete pet
curl -X DELETE http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN"

# Verify pet is deleted (should fail)
curl -X GET http://localhost:3000/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN"

# Try to delete non-existent pet (might succeed or fail)
curl -X DELETE http://localhost:3000/api/pets/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"
```

---

## TASKS API

### 1. POST /api/tasks - Create Task

Create a new care task for a pet.

**Request:**
```bash
PET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId": "'$PET_ID'",
    "type": "feeding",
    "title": "Morning feeding",
    "description": "Feed Buddy in the morning",
    "frequency": "daily",
    "nextDueDate": "2026-04-14"
  }'
```

**Request Body:**
```json
{
  "petId": "uuid (required)",
  "type": "string (required, 1-50 chars, e.g. feeding, grooming, medicine)",
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000 chars)",
  "frequency": "daily | weekly | monthly | one-time (required)",
  "nextDueDate": "YYYY-MM-DD or ISO datetime (required)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "760e8400-e29b-41d4-a716-446655440010",
    "petId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "feeding",
    "title": "Morning feeding",
    "description": "Feed Buddy in the morning",
    "frequency": "daily",
    "nextDueDate": "2026-04-14T00:00:00Z",
    "isCompleted": false,
    "createdAt": "2026-04-14T10:35:00Z"
  }
}
```

**Test Variations:**
```bash
# Create daily feeding task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId":"'$PET_ID'",
    "type":"feeding",
    "title":"Dinner time",
    "description":"Feed in evening",
    "frequency":"daily",
    "nextDueDate":"2026-04-15"
  }'

# Create weekly grooming task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId":"'$PET_ID'",
    "type":"grooming",
    "title":"Bath and brush",
    "frequency":"weekly",
    "nextDueDate":"2026-04-20"
  }'

# Create one-time vet appointment
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId":"'$PET_ID'",
    "type":"vet_checkup",
    "title":"Annual checkup",
    "description":"Vaccinations and health check",
    "frequency":"one-time",
    "nextDueDate":"2026-04-30"
  }'

# Missing required field (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId":"'$PET_ID'",
    "type":"feeding",
    "title":"Breakfast",
    "frequency":"daily"
  }'

# Invalid frequency (should fail)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId":"'$PET_ID'",
    "type":"feeding",
    "title":"Lunch",
    "frequency":"hourly",
    "nextDueDate":"2026-04-15"
  }'
```

---

### 2. GET /api/tasks?petId=... - List Tasks for Pet

Get all tasks for a specific pet.

**Request:**
```bash
PET_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET "http://localhost:3000/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "760e8400-e29b-41d4-a716-446655440010",
      "petId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "feeding",
      "title": "Morning feeding",
      "description": "Feed Buddy in the morning",
      "frequency": "daily",
      "nextDueDate": "2026-04-14T00:00:00Z",
      "isCompleted": false,
      "createdAt": "2026-04-14T10:35:00Z"
    }
  ]
}
```

**Error Response (400 - Missing petId):**
```json
{
  "success": false,
  "error": "Missing petId query parameter"
}
```

**Test Cases:**
```bash
# List tasks for pet
curl -X GET "http://localhost:3000/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Without petId parameter (should fail)
curl -X GET "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $TOKEN"

# Access another user's pet tasks (should fail with 403)
curl -X GET "http://localhost:3000/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN2"
```

---

### 3. PUT /api/tasks/:id - Update Task

Update specific fields of a task.

**Request:**
```bash
TASK_ID="760e8400-e29b-41d4-a716-446655440010"

curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated morning feeding",
    "nextDueDate": "2026-04-15"
  }'
```

**Request Body (all optional):**
```json
{
  "type": "string (1-50 chars)",
  "title": "string (1-200 chars)",
  "description": "string (max 1000 chars)",
  "frequency": "daily | weekly | monthly | one-time",
  "nextDueDate": "YYYY-MM-DD or ISO datetime",
  "isCompleted": "boolean"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "760e8400-e29b-41d4-a716-446655440010",
    "petId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "feeding",
    "title": "Updated morning feeding",
    "description": "Feed Buddy in the morning",
    "frequency": "daily",
    "nextDueDate": "2026-04-15T00:00:00Z",
    "isCompleted": false,
    "createdAt": "2026-04-14T10:35:00Z"
  }
}
```

**Test Cases:**
```bash
# Update title only
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "New title"}'

# Update multiple fields
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"frequency": "weekly", "nextDueDate": "2026-04-20"}'

# Mark as completed
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isCompleted": true}'
```

---

### 4. POST /api/tasks/:id/complete - Mark Task Complete

Mark a task as complete and log it to care history. Automatically calculates next due date based on frequency.

**Request:**
```bash
TASK_ID="760e8400-e29b-41d4-a716-446655440010"

curl -X POST http://localhost:3000/api/tasks/$TASK_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "notes": "Fed Buddy at 7am"
  }'
```

**Request Body (optional):**
```json
{
  "notes": "string (optional, max 1000 chars)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "970e8400-e29b-41d4-a716-446655440020",
    "petId": "550e8400-e29b-41d4-a716-446655440000",
    "taskId": "760e8400-e29b-41d4-a716-446655440010",
    "taskType": "feeding",
    "completedAt": "2026-04-14T12:00:00Z",
    "notes": "Fed Buddy at 7am"
  }
}
```

**Auto-calculating Next Due Date:**
- **daily**: Next due date = today + 1 day
- **weekly**: Next due date = today + 7 days
- **monthly**: Next due date = today + 1 month
- **one-time**: Next due date = NULL (task stays completed)

**Test Cases:**
```bash
# Complete task with notes
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"notes": "Buddy ate all his food"}'

# Complete task without notes
curl -X POST http://localhost:3000/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'

# Verify task was marked complete
curl -X GET "http://localhost:3000/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | select(.id == "'$TASK_ID'")'
```

---

### 5. DELETE /api/tasks/:id - Delete Task

Delete a task permanently.

**Request:**
```bash
TASK_ID="760e8400-e29b-41d4-a716-446655440010"

curl -X DELETE http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Test Cases:**
```bash
# Delete task
curl -X DELETE http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"

# Verify task is deleted
curl -X GET "http://localhost:3000/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Complete Workflow Example

Full workflow from creating user → pet → tasks → completing tasks:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# ===== STEP 1: Create User =====
echo "=== STEP 1: Creating User ==="
USER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "petowner@example.com",
    "password": "SecurePass123",
    "name": "Pet Owner"
  }')

TOKEN=$(echo $USER_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $USER_RESPONSE | jq -r '.data.user.id')
echo "User created: $USER_ID"
echo "Token: $TOKEN"

# ===== STEP 2: Create Pet =====
echo -e "\n=== STEP 2: Creating Pet ==="
PET_RESPONSE=$(curl -s -X POST $BASE_URL/api/pets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Buddy",
    "type": "dog",
    "breed": "Golden Retriever",
    "gender": "male",
    "dateOfBirth": "2023-06-15"
  }')

PET_ID=$(echo $PET_RESPONSE | jq -r '.data.id')
echo "Pet created: $PET_ID"
echo $PET_RESPONSE | jq '.'

# ===== STEP 3: Create Tasks =====
echo -e "\n=== STEP 3: Creating Tasks ==="

TASK1=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId": "'$PET_ID'",
    "type": "feeding",
    "title": "Morning feeding",
    "frequency": "daily",
    "nextDueDate": "2026-04-14"
  }')

TASK1_ID=$(echo $TASK1 | jq -r '.data.id')
echo "Task 1 created: $TASK1_ID"

TASK2=$(curl -s -X POST $BASE_URL/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "petId": "'$PET_ID'",
    "type": "grooming",
    "title": "Bath",
    "frequency": "weekly",
    "nextDueDate": "2026-04-20"
  }')

TASK2_ID=$(echo $TASK2 | jq -r '.data.id')
echo "Task 2 created: $TASK2_ID"

# ===== STEP 4: List Tasks =====
echo -e "\n=== STEP 4: Listing Tasks ==="
curl -s -X GET "$BASE_URL/api/tasks?petId=$PET_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

# ===== STEP 5: Complete Task =====
echo -e "\n=== STEP 5: Completing Task ==="
curl -s -X POST $BASE_URL/api/tasks/$TASK1_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"notes": "Fed Buddy at 7am"}' | jq '.'

# ===== STEP 6: Update Task =====
echo -e "\n=== STEP 6: Updating Task ==="
curl -s -X PUT $BASE_URL/api/tasks/$TASK2_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Bath and nail trim"}' | jq '.'

# ===== STEP 7: Get Pet Details =====
echo -e "\n=== STEP 7: Getting Pet Details ==="
curl -s -X GET $BASE_URL/api/pets/$PET_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# ===== STEP 8: Update Pet =====
echo -e "\n=== STEP 8: Updating Pet ==="
curl -s -X PUT $BASE_URL/api/pets/$PET_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Buddy Jr."}' | jq '.'

# ===== STEP 9: List All Pets =====
echo -e "\n=== STEP 9: Listing All Pets ==="
curl -s -X GET $BASE_URL/api/pets \
  -H "Authorization: Bearer $TOKEN" | jq '.data'

echo -e "\n=== Workflow Complete ==="
```

Save as `pet-task-workflow.sh`, run with `chmod +x pet-task-workflow.sh && ./pet-task-workflow.sh`

---

## Error Responses

All endpoints follow consistent error response format:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Pet not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create pet"
}
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing or invalid token | Get fresh token from `/api/auth/login` |
| 403 Forbidden | Not pet/task owner | Verify petId/taskId belongs to your account |
| 400 Bad Request | Invalid data format | Check request body matches schema |
| 502 Bad Gateway | Server error | Wait a moment and retry |
| CORS Error | Browser cross-origin issue | Ensure `Content-Type: application/json` header |

---

## Testing Checklist

- [ ] Create account (signup)
- [ ] Login and get token
- [ ] Create pet
- [ ] List pets
- [ ] Get single pet
- [ ] Update pet
- [ ] Delete pet
- [ ] Create task
- [ ] List tasks for pet
- [ ] Update task
- [ ] Complete task
- [ ] Delete task
- [ ] Test error cases (missing auth, invalid data)
- [ ] Test ownership verification (403 errors)

---

**Build Status:** ✅ **PASSING**  
**All Routes:** ✅ **13 DEPLOYED**  
**Type Safety:** ✅ **STRICT MODE**  
**Authentication:** ✅ **REQUIRED ON ALL PROTECTED ROUTES**
