require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const carsRoutes = require('./routes/cars');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Electric Cars API is running!' });
});

app.use('/api/cars', carsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
