import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/metrics');
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Could not connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const onTimeLateData = {
    labels: ['On Time', 'Late'],
    datasets: [
      {
        data: [data.onTime, data.late],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#66BB6A', '#EF5350']
      }
    ]
  };

  const fuelCostData = {
    labels: Object.keys(data.fuelCosts),
    datasets: [
      {
        label: 'Fuel Cost (₹)',
        data: Object.values(data.fuelCosts),
        backgroundColor: ['#2196F3', '#FFC107', '#F44336']
      }
    ]
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: 40
        }}
      >
        <KpiCard
          title="Total Profit"
          value={`₹${data.totalProfit.toLocaleString()}`}
        />
        <KpiCard title="Efficiency Score" value={`${data.efficiency}%`} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 40
        }}
      >
        <div style={{ width: 350 }}>
          <h3>On-time vs Late Deliveries</h3>
          <Pie data={onTimeLateData} />
        </div>

        <div style={{ width: 350 }}>
          <h3>Fuel Cost Breakdown</h3>
          <Bar
            data={fuelCostData}
            options={{ scales: { y: { beginAtZero: true } } }}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        width: '200px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h2>{title}</h2>
      <p style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>{value}</p>
    </div>
  );
}
