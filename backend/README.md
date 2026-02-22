# Electric Cars Backend API

Backend API for the Electric Cars Explorer application.

## Features
- RESTful API for car data
- User authentication (JWT)
- User favorites management
- SQLite database

## Installation

```bash
npm install
```

## Setup

1. Environment variables are in `.env` file
2. Database is automatically created on first run
3. Cars are seeded from `../cars.json`

## Run Server

```bash
npm start
```

Server runs on: http://localhost:5000

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Favorites (Protected)
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites/:carId` - Add to favorites
- `DELETE /api/favorites/:carId` - Remove from favorites

## Tech Stack
- Node.js
- Express
- SQLite3
- JWT
- bcrypt
