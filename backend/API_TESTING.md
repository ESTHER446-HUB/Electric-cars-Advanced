# Backend API Testing Guide

## Start the Server
```bash
cd backend
npm start
```

Server should run on: http://localhost:5000

## Test Endpoints

### 1. Check if API is running
```bash
curl http://localhost:5000
```
Expected: `{"message": "Electric Cars API is running!"}`

### 2. Get all cars
```bash
curl http://localhost:5000/api/cars
```

### 3. Get single car
```bash
curl http://localhost:5000/api/cars/1
```

### 4. Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### 5. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response!

### 6. Get favorites (requires token)
```bash
curl http://localhost:5000/api/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Add to favorites (requires token)
```bash
curl -X POST http://localhost:5000/api/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Remove from favorites (requires token)
```bash
curl -X DELETE http://localhost:5000/api/favorites/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps
Once backend is tested, we'll connect the frontend to use these APIs instead of the local JSON file.
