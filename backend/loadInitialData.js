const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Route = require('./models/Route');
const Order = require('./models/Order');
const fs = require('fs');
const csv = require('csv-parser');

async function loadInitialData() {
  const loadCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  };

  await Driver.deleteMany();
  await Route.deleteMany();
  await Order.deleteMany();

  let drivers = await loadCSV('./data/drivers.csv');
  let routes = await loadCSV('./data/routes.csv');
  let orders = await loadCSV('./data/orders.csv');

  // Convert past7DaysHours to a single number (sum)
  drivers = drivers.map((driver) => ({
    ...driver,
    past7DaysHours: driver.past7DaysHours
      ? driver.past7DaysHours
          .split('|')
          .map((h) => Number(h))
          .reduce((sum, h) => sum + h, 0)
      : 0
  }));

  await Driver.insertMany(drivers);
  await Route.insertMany(routes);
  await Order.insertMany(orders);

  console.log('✅ Initial CSV data loaded into MongoDB');
}

module.exports = loadInitialData;
