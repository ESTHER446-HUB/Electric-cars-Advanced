const db = require('./database');
const fs = require('fs');
const path = require('path');

const carsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../cars.json'), 'utf8')
);

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO cars (id, name, range, price, topSpeed, battery, seats, description, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  carsData.forEach(car => {
    stmt.run(
      car.id,
      car.name,
      car.range,
      car.price,
      car.topSpeed,
      car.battery,
      car.seats,
      car.description,
      car.image
    );
  });

  stmt.finalize();
  console.log(`${carsData.length} cars imported successfully!`);
  db.close();
});
