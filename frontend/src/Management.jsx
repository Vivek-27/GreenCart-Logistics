import React, { useState, useEffect } from 'react';

export default function Management() {
  // fake login state
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [tab, setTab] = useState('drivers');
  const [data, setData] = useState({ drivers: [], routes: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  // ===== FETCH DATA =====
  const fetchData = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://greencart-logistics-backend-d21p.onrender.com/${t}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Ensure it's always an array
      setData((d) => ({ ...d, [t]: Array.isArray(json) ? json : [] }));
    } catch (err) {
      console.error(err);
      setData((d) => ({ ...d, [t]: [] })); // fallback empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
  }, [tab]);

  const handleTabChange = (t) => {
    setTab(t);
    setEditId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId === null) {
        await fetch(
          `https://greencart-logistics-backend-d21p.onrender.com/${tab}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }
        );
      } else {
        await fetch(
          `https://greencart-logistics-backend-d21p.onrender.com/${tab}/${editId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }
        );
        setEditId(null);
      }
      fetchData(tab);
      setFormData({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await fetch(
        `https://greencart-logistics-backend-d21p.onrender.com/${tab}/${id}`,
        { method: 'DELETE' }
      );
      fetchData(tab);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (tab === 'drivers') {
      return (
        <>
          <label>
            Name: <br />
            <input
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Current Shift Hours: <br />
            <input
              name="currentShiftHours"
              type="number"
              min="0"
              value={formData.currentShiftHours || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Past 7 Days Hours: <br />
            <input
              name="past7DaysHours"
              type="number"
              min="0"
              value={formData.past7DaysHours || ''}
              onChange={handleChange}
              required
            />
          </label>
        </>
      );
    }
    if (tab === 'routes') {
      return (
        <>
          <label>
            Route ID: <br />
            <input
              name="routeId"
              value={formData.routeId || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Distance (Km): <br />
            <input
              name="distanceKm"
              type="number"
              min="0"
              value={formData.distanceKm || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Traffic Level: <br />
            <select
              name="trafficLevel"
              value={formData.trafficLevel || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label>
            Base Time (min): <br />
            <input
              name="baseTimeMin"
              type="number"
              min="0"
              value={formData.baseTimeMin || ''}
              onChange={handleChange}
              required
            />
          </label>
        </>
      );
    }
    if (tab === 'orders') {
      return (
        <>
          <label>
            Order ID: <br />
            <input
              name="orderId"
              value={formData.orderId || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Value (₹): <br />
            <input
              name="valueRs"
              type="number"
              min="0"
              value={formData.valueRs || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Assigned Route: <br />
            <input
              name="assignedRoute"
              value={formData.assignedRoute || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Delivery Timestamp: <br />
            <input
              name="deliveryTimestamp"
              type="datetime-local"
              value={formData.deliveryTimestamp || ''}
              onChange={handleChange}
              required
            />
          </label>
        </>
      );
    }
  };

  const renderTable = () => {
    const items = Array.isArray(data[tab]) ? data[tab] : [];
    if (loading) {
      return <p>Loading...</p>;
    }
    if (!items.length) {
      return <p>No data available</p>;
    }

    if (tab === 'drivers') {
      return (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Shift Hours</th>
              <th>Past 7 Days Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.currentShiftHours}</td>
                <td>{d.past7DaysHours}</td>
                <td>
                  <button onClick={() => handleEdit(d)} disabled={loading}>
                    Edit
                  </button>{' '}
                  <button onClick={() => handleDelete(d.id)} disabled={loading}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (tab === 'routes') {
      return (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Distance (Km)</th>
              <th>Traffic Level</th>
              <th>Base Time (min)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>{r.routeId}</td>
                <td>{r.distanceKm}</td>
                <td>{r.trafficLevel}</td>
                <td>{r.baseTimeMin}</td>
                <td>
                  <button onClick={() => handleEdit(r)} disabled={loading}>
                    Edit
                  </button>{' '}
                  <button onClick={() => handleDelete(r.id)} disabled={loading}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (tab === 'orders') {
      return (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Value (₹)</th>
              <th>Assigned Route</th>
              <th>Delivery Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.orderId}</td>
                <td>{o.valueRs}</td>
                <td>{o.assignedRoute}</td>
                <td>{new Date(o.deliveryTimestamp).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEdit(o)} disabled={loading}>
                    Edit
                  </button>{' '}
                  <button onClick={() => handleDelete(o.id)} disabled={loading}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '10px 20px',
        boxSizing: 'border-box'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Management</h2>

      {/* Tabs */}
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center'
        }}
      >
        {['drivers', 'routes', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            style={{
              flex: '1 0 120px', // buttons grow and wrap nicely, min width 120px
              padding: '10px 0',
              backgroundColor: tab === t ? '#1976d2' : '#eee',
              color: tab === t ? 'white' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 16
            }}
            disabled={loading}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>{renderTable()}</div>

      {/* Form */}
      <h3 style={{ marginTop: 30, textAlign: 'center' }}>
        {editId ? 'Edit' : 'Add New'} {tab.slice(0, -1)}
      </h3>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 15,
          maxWidth: 500,
          margin: '0 auto'
        }}
      >
        {renderFormFields()}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            padding: '12px 0',
            fontSize: 18
          }}
        >
          {loading ? 'Saving...' : editId ? 'Update' : 'Add'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setFormData({});
            }}
            style={{
              ...buttonStyle,
              backgroundColor: '#f44336',
              marginTop: 5,
              fontSize: 16
            }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: 20,
  minWidth: 600 // ensure horizontal scroll on narrow screens
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};
