import React, { useState, useEffect } from 'react';

export default function Simulation() {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [orders, setOrders] = useState([]);

  const [driversCount, setDriversCount] = useState(2);
  const [startTime, setStartTime] = useState('08:00');
  const [maxHours, setMaxHours] = useState(8);

  const [results, setResults] = useState(null);

  useEffect(() => {
    // Fetch data from backend when component loads
    Promise.all([
      fetch(
        'https://greencart-logistics-backend-d21p.onrender.com/drivers'
      ).then((res) => res.json()),
      fetch(
        'https://greencart-logistics-backend-d21p.onrender.com/routes'
      ).then((res) => res.json()),
      fetch(
        'https://greencart-logistics-backend-d21p.onrender.com/orders'
      ).then((res) => res.json())
    ])
      .then(([driversData, routesData, ordersData]) => {
        setDrivers(driversData);
        setRoutes(routesData);
        setOrders(ordersData);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
      });
  }, []);

  const findRoute = (routeId) => routes.find((r) => r.routeId === routeId);

  const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const runSimulation = () => {
    if (drivers.length === 0 || routes.length === 0 || orders.length === 0) {
      alert('Data not loaded from backend yet.');
      return;
    }

    if (driversCount < 1) {
      alert('Drivers count must be at least 1');
      return;
    }
    if (driversCount > drivers.length) {
      alert(`Maximum drivers available: ${drivers.length}`);
      return;
    }
    if (maxHours < 1 || maxHours > 24) {
      alert('Max hours per driver must be between 1 and 24');
      return;
    }

    const availableDrivers = drivers.slice(0, driversCount);
    let driverIndex = 0;

    const orderResults = orders.map((order) => {
      const driver = availableDrivers[driverIndex];
      driverIndex = (driverIndex + 1) % driversCount;

      const fatigued = driver.currentShiftHours > 8;

      const route = findRoute(order.assignedRoute);
      if (!route) {
        throw new Error(`Route not found: ${order.assignedRoute}`);
      }

      const speedFactor = fatigued ? 0.7 : 1;
      const baseDeliveryTime = route.baseTimeMin / speedFactor;
      const routeStartMin = timeToMinutes(startTime);

      const trafficDelay =
        route.trafficLevel === 'High'
          ? 20
          : route.trafficLevel === 'Medium'
          ? 10
          : 0;

      const actualDeliveryMin = routeStartMin + baseDeliveryTime + trafficDelay;

      const todayDate = new Date().toISOString().split('T')[0];
      const actualDeliveryTime = new Date(
        `${todayDate}T${String(Math.floor(actualDeliveryMin / 60)).padStart(
          2,
          '0'
        )}:${String(Math.floor(actualDeliveryMin % 60)).padStart(2, '0')}:00`
      );

      const allowedDeliveryMin = route.baseTimeMin + 10;
      const isLate = actualDeliveryMin > routeStartMin + allowedDeliveryMin;

      const penalty = isLate ? 50 : 0;
      const bonus = order.valueRs > 1000 && !isLate ? 0.1 * order.valueRs : 0;

      const baseFuelCost = 5 * route.distanceKm;
      const trafficFuelSurcharge =
        route.trafficLevel === 'High' ? 2 * route.distanceKm : 0;
      const fuelCost = baseFuelCost + trafficFuelSurcharge;

      return {
        orderId: order.orderId,
        valueRs: order.valueRs,
        driver: driver.name,
        actualDeliveryTime,
        isLate,
        penalty,
        bonus,
        fuelCost,
        trafficLevel: route.trafficLevel
      };
    });

    const totalProfit = orderResults.reduce(
      (sum, o) => sum + o.valueRs + o.bonus - o.penalty - o.fuelCost,
      0
    );

    const totalDeliveries = orderResults.length;
    const onTimeDeliveries = orderResults.filter((o) => !o.isLate).length;
    const efficiency = (onTimeDeliveries / totalDeliveries) * 100;

    const fuelCostByTraffic = { Low: 0, Medium: 0, High: 0 };
    orderResults.forEach((o) => {
      fuelCostByTraffic[o.trafficLevel] += o.fuelCost;
    });

    setResults({
      totalProfit: Math.round(totalProfit),
      efficiency: Math.round(efficiency),
      onTimeDeliveries,
      lateDeliveries: totalDeliveries - onTimeDeliveries,
      fuelCostBreakdown: fuelCostByTraffic,
      orderResults
    });
  };
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '20px auto',
        padding: '0 15px', // add horizontal padding on small screens
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
        Delivery Simulation
      </h2>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Number of Drivers:
        <input
          type="number"
          min="1"
          max={drivers.length}
          value={driversCount}
          onChange={(e) => setDriversCount(Number(e.target.value))}
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Route Start Time:
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'block', marginBottom: 16 }}>
        Max Hours per Driver:
        <input
          type="number"
          min="1"
          max="24"
          value={maxHours}
          onChange={(e) => setMaxHours(Number(e.target.value))}
          style={inputStyle}
        />
      </label>

      <button onClick={runSimulation} style={buttonStyle}>
        Run Simulation
      </button>

      {results && (
        <div style={{ marginTop: 40 }}>
          <h3>Simulation Results</h3>
          <p>
            <strong>Total Profit:</strong> ₹
            {results.totalProfit.toLocaleString()}
          </p>
          <p>
            <strong>Efficiency Score:</strong> {results.efficiency}%
          </p>
          <p>
            <strong>On-time Deliveries:</strong> {results.onTimeDeliveries}
          </p>
          <p>
            <strong>Late Deliveries:</strong> {results.lateDeliveries}
          </p>

          <h4>Fuel Cost Breakdown</h4>
          <ul>
            <li>Low Traffic: ₹{results.fuelCostBreakdown.Low}</li>
            <li>Medium Traffic: ₹{results.fuelCostBreakdown.Medium}</li>
            <li>High Traffic: ₹{results.fuelCostBreakdown.High}</li>
          </ul>

          <h4>Order Details</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Driver</th>
                  <th>Value (₹)</th>
                  <th>Actual Delivery</th>
                  <th>Late?</th>
                  <th>Penalty (₹)</th>
                  <th>Bonus (₹)</th>
                  <th>Fuel Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {results.orderResults.map((o) => (
                  <tr key={o.orderId}>
                    <td>{o.orderId}</td>
                    <td>{o.driver}</td>
                    <td>{o.valueRs}</td>
                    <td>
                      {o.actualDeliveryTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>{o.isLate ? 'Yes' : 'No'}</td>
                    <td>{o.penalty}</td>
                    <td>{Math.round(o.bonus)}</td>
                    <td>{Math.round(o.fuelCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  fontSize: 16,
  marginTop: 6,
  borderRadius: 4,
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const buttonStyle = {
  padding: '12px 20px',
  marginTop: 10,
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 16,
  width: '100%'
};

const tableStyle = {
  width: '100%',
  minWidth: 700, // force horizontal scroll on small screens
  borderCollapse: 'collapse',
  marginTop: 16,
  textAlign: 'left'
};
