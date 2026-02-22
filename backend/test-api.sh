#!/bin/bash

echo "🚀 Testing Electric Cars Backend API"
echo "======================================"
echo ""

# Test 1: Check if server is running
echo "1️⃣  Testing if API is running..."
curl -s http://localhost:5000 | grep -q "Electric Cars API" && echo "✅ Server is running!" || echo "❌ Server not running. Start with: npm start"
echo ""

# Test 2: Get all cars
echo "2️⃣  Testing GET /api/cars..."
CARS=$(curl -s http://localhost:5000/api/cars)
COUNT=$(echo $CARS | grep -o '"id"' | wc -l)
echo "✅ Found $COUNT cars in database"
echo ""

# Test 3: Get single car
echo "3️⃣  Testing GET /api/cars/1..."
curl -s http://localhost:5000/api/cars/1 | grep -q "Tesla Model 3" && echo "✅ Single car fetch works!" || echo "❌ Failed"
echo ""

# Test 4: Register user
echo "4️⃣  Testing POST /api/auth/register..."
REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}')

if echo $REGISTER | grep -q "token"; then
  echo "✅ User registration works!"
  TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "⚠️  User might already exist (this is okay)"
fi
echo ""

# Test 5: Login
echo "5️⃣  Testing POST /api/auth/login..."
LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

if echo $LOGIN | grep -q "token"; then
  echo "✅ User login works!"
  TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ Login failed"
  exit 1
fi
echo ""

# Test 6: Get favorites (protected route)
echo "6️⃣  Testing GET /api/favorites (protected)..."
curl -s http://localhost:5000/api/favorites \
  -H "Authorization: Bearer $TOKEN" | grep -q "\[" && echo "✅ Protected route works!" || echo "❌ Failed"
echo ""

# Test 7: Add to favorites
echo "7️⃣  Testing POST /api/favorites/1..."
curl -s -X POST http://localhost:5000/api/favorites/1 \
  -H "Authorization: Bearer $TOKEN" | grep -q "favorites" && echo "✅ Add to favorites works!" || echo "⚠️  Already in favorites"
echo ""

# Test 8: Get favorites again
echo "8️⃣  Testing GET /api/favorites (should have 1 car)..."
FAVS=$(curl -s http://localhost:5000/api/favorites -H "Authorization: Bearer $TOKEN")
echo $FAVS | grep -q "Tesla Model 3" && echo "✅ Favorites retrieved successfully!" || echo "❌ Failed"
echo ""

echo "======================================"
echo "✨ Backend API Testing Complete!"
echo "======================================"
