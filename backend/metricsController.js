const Order = require('./models/Order');

// Hardcoded route details (replace with DB later if you have a Route model)
const routes = {
  1: { baseTime: 120, distanceKm: 15, traffic: 'Low' },
  2: { baseTime: 70, distanceKm: 10, traffic: 'Medium' },
  3: { baseTime: 40, distanceKm: 8, traffic: 'High' },
  4: { baseTime: 60, distanceKm: 12, traffic: 'Low' },
  5: { baseTime: 50, distanceKm: 11, traffic: 'Medium' },
  6: { baseTime: 75, distanceKm: 14, traffic: 'High' },
  7: { baseTime: 90, distanceKm: 18, traffic: 'Low' },
  8: { baseTime: 65, distanceKm: 13, traffic: 'Medium' },
  9: { baseTime: 55, distanceKm: 9, traffic: 'High' },
  10: { baseTime: 80, distanceKm: 16, traffic: 'Low' }
};

exports.getMetrics = async (req, res) => {
  const orders = await Order.find();

  let totalProfit = 0;
  let onTime = 0;
  let late = 0;
  let fuelCostBreakdown = { Low: 0, Medium: 0, High: 0 };

  orders.forEach((order) => {
    const route = routes[order.assignedRoute];
    if (!route) return;

    let fuelCost = route.distanceKm * 5;
    if (route.traffic === 'High') fuelCost += route.distanceKm * 2;
    fuelCostBreakdown[route.traffic] += fuelCost;

    let isLate = timeToMinutes(order.deliveryTimestamp) > route.baseTime + 10;
    let penalty = isLate ? 50 : 0;
    if (isLate) late++;
    else onTime++;

    let bonus = 0;
    if (!isLate && order.valueRs > 1000) {
      bonus = order.valueRs * 0.1;
    }

    let profit = order.valueRs + bonus - penalty - fuelCost;
    totalProfit += profit;
  });

  const efficiency = (onTime / orders.length) * 100;

  res.json({
    totalProfit: Math.round(totalProfit),
    efficiency: Math.round(efficiency),
    onTime,
    late,
    fuelCosts: {
      LowTraffic: Math.round(fuelCostBreakdown.Low),
      MediumTraffic: Math.round(fuelCostBreakdown.Medium),
      HighTraffic: Math.round(fuelCostBreakdown.High)
    }
  });
};

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
