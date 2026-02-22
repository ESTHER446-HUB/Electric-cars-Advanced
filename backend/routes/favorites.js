const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// GET user's favorites
router.get('/', authMiddleware, (req, res) => {
  db.all(
    `SELECT cars.* FROM favorites 
     JOIN cars ON favorites.car_id = cars.id 
     WHERE favorites.user_id = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// POST add to favorites
router.post('/:carId', authMiddleware, (req, res) => {
  db.run(
    'INSERT INTO favorites (user_id, car_id) VALUES (?, ?)',
    [req.user.id, req.params.carId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Car already in favorites' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Added to favorites' });
    }
  );
});

// DELETE remove from favorites
router.delete('/:carId', authMiddleware, (req, res) => {
  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND car_id = ?',
    [req.user.id, req.params.carId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
      res.json({ message: 'Removed from favorites' });
    }
  );
});

module.exports = router;
