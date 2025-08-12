const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
app.use(
  cors({
    origin: 'https://greencart-logistics-iwp1.onrender.com', // your frontend address
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);
app.use(bodyParser.json());

// Connect to MongoDB (replace connection string with your own)
const loadInitialData = require('./loadInitialData');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/greencart';
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('MongoDB connected');
    await loadInitialData(); // Load CSV into DB
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes will be added here

const driversRouter = require('./routes/drivers');
const routesRouter = require('./routes/routes');
const ordersRouter = require('./routes/orders');

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// protected routes — apply auth middleware
const { requireAuth } = require('./middleware/auth');

app.use('/drivers', driversRouter);
app.use('/routes', routesRouter);
app.use('/orders', ordersRouter);

const Driver = require('./models/Driver');
const Route = require('./models/Route');
const Order = require('./models/Order');

const metricsController = require('./metricsController.js');
// API endpoint
app.get('/api/metrics', metricsController.getMetrics);
app.post('/simulate', async (req, res) => {
  try {
    const { numberOfDrivers, routeStartTime, maxHoursPerDriver } = req.body;

    // Validate inputs
    if (
      !numberOfDrivers ||
      !routeStartTime ||
      !maxHoursPerDriver ||
      typeof numberOfDrivers !== 'number' ||
      typeof maxHoursPerDriver !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }

    if (numberOfDrivers < 1) {
      return res
        .status(400)
        .json({ error: 'numberOfDrivers must be at least 1' });
    }

    // Load data from DB
    const drivers = await Driver.find().limit(numberOfDrivers);
    const routes = await Route.find();
    const orders = await Order.find();

    if (numberOfDrivers > drivers.length) {
      return res.status(400).json({ error: 'Not enough drivers available' });
    }

    // Helper functions
    const timeToMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Map routes by routeId
    const routeMap = {};
    for (const r of routes) {
      routeMap[r.routeId] = r;
    }

    // Simulation logic similar to frontend example:
    let driverIndex = 0;
    const orderResults = [];

    for (const order of orders) {
      const driver = drivers[driverIndex];
      driverIndex = (driverIndex + 1) % numberOfDrivers;

      const fatigued = driver.currentShiftHours > 8;
      const route = routeMap[order.assignedRoute];
      if (!route) continue; // skip if route missing

      const speedFactor = fatigued ? 0.7 : 1;
      const baseDeliveryTime = route.baseTimeMin / speedFactor;
      const routeStartMin = timeToMinutes(routeStartTime);

      const trafficDelay =
        route.trafficLevel === 'High'
          ? 20
          : route.trafficLevel === 'Medium'
          ? 10
          : 0;

      const actualDeliveryMin = routeStartMin + baseDeliveryTime + trafficDelay;

      const allowedDeliveryMin = route.baseTimeMin + 10;
      const isLate = actualDeliveryMin > routeStartMin + allowedDeliveryMin;
      const penalty = isLate ? 50 : 0;
      const bonus = order.valueRs > 1000 && !isLate ? 0.1 * order.valueRs : 0;

      const baseFuelCost = 5 * route.distanceKm;
      const trafficFuelSurcharge =
        route.trafficLevel === 'High' ? 2 * route.distanceKm : 0;
      const fuelCost = baseFuelCost + trafficFuelSurcharge;

      orderResults.push({
        orderId: order.orderId,
        valueRs: order.valueRs,
        driverName: driver.name,
        isLate,
        penalty,
        bonus,
        fuelCost
      });
    }

    // KPIs calculation
    const totalProfit = orderResults.reduce(
      (sum, o) => sum + o.valueRs + o.bonus - o.penalty - o.fuelCost,
      0
    );
    const totalDeliveries = orderResults.length;
    const onTimeDeliveries = orderResults.filter((o) => !o.isLate).length;
    const efficiency =
      totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;

    // Fuel cost breakdown
    const fuelCostByTraffic = { Low: 0, Medium: 0, High: 0 };
    for (const o of orderResults) {
      const order = orders.find((ord) => ord.orderId === o.orderId);
      const route = routeMap[order.assignedRoute];
      fuelCostByTraffic[route.trafficLevel] += o.fuelCost;
    }

    res.json({
      totalProfit: Math.round(totalProfit),
      efficiency: Math.round(efficiency),
      onTimeDeliveries,
      lateDeliveries: totalDeliveries - onTimeDeliveries,
      fuelCostBreakdown: fuelCostByTraffic,
      orders: orderResults
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
