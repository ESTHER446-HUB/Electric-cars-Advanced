# Electric Cars Explorer

A full-stack web application for browsing electric vehicles with user authentication and favorites management.

## Features

- Browse 15 electric cars with detailed specifications
- Real-time search and sorting
- User authentication (register/login)
- Save favorite cars
- Responsive design for all devices
- Prices in Kenyan Shillings (KES)

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+)  
**Backend:** Node.js, Express, SQLite3, JWT

## Project Structure

```
Electric-cars-Advanced/
├── frontend/          # Frontend application
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── cars.json
│   └── favicon.svg
├── backend/           # Backend API
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── database.js
│   └── package.json
└── README.MD
```

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on: http://localhost:5000

### Frontend Setup
```bash
cd frontend
python3 -m http.server 8000
```
Frontend runs on: http://localhost:8000

Or simply open `frontend/index.html` in your browser.

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Favorites (Protected)
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:carId` - Add to favorites
- `DELETE /api/favorites/:carId` - Remove from favorites

## Author

Esther Kuria  
Email: Esther.kuria@student.moringaschool.com  
GitHub: https://github.com/ESTHER446-HUB

## License

MIT License

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Backend → Render.com
2. Frontend → Netlify.com
3. Update API URL in `frontend/script.js`

**Live Demo:** [Add your deployed URL here]
