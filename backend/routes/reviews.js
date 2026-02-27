const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// Get reviews for a car
router.get('/:carId', (req, res) => {
  const { carId } = req.params;
  
  db.all(
    `SELECT r.*, u.username FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.car_id = ? 
     ORDER BY r.created_at DESC`,
    [carId],
    (err, reviews) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(reviews);
    }
  );
});

// Add review
router.post('/:carId', auth, (req, res) => {
  const { carId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  db.run(
    'INSERT INTO reviews (user_id, car_id, rating, comment) VALUES (?, ?, ?, ?)',
    [userId, carId, rating, comment],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Review added successfully' });
    }
  );
});

// Get average rating for a car
router.get('/:carId/average', (req, res) => {
  const { carId } = req.params;
  
  db.get(
    'SELECT AVG(rating) as avgRating, COUNT(*) as totalReviews FROM reviews WHERE car_id = ?',
    [carId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

module.exports = router;
