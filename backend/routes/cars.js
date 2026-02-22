const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all cars
router.get('/', (req, res) => {
  db.all('SELECT * FROM cars ORDER BY id', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET single car by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM cars WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(row);
  });
});

// POST create new car
router.post('/', (req, res) => {
  const { name, range, price, topSpeed, battery, seats, description, image } = req.body;
  
  db.run(
    `INSERT INTO cars (name, range, price, topSpeed, battery, seats, description, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, range, price, topSpeed, battery, seats, description, image],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Car created successfully' });
    }
  );
});

// PUT update car
router.put('/:id', (req, res) => {
  const { name, range, price, topSpeed, battery, seats, description, image } = req.body;
  
  db.run(
    `UPDATE cars SET name = ?, range = ?, price = ?, topSpeed = ?, battery = ?, seats = ?, description = ?, image = ?
     WHERE id = ?`,
    [name, range, price, topSpeed, battery, seats, description, image, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }
      res.json({ message: 'Car updated successfully' });
    }
  );
});

// DELETE car
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM cars WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  });
});

module.exports = router;
