import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate
} from 'react-router-dom';
import Dashboard from './Dashboard';
import Simulation from './Simulation';
import Management from './Management';
import Login from './Login';

// Protected Route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute token:', token);
  if (!token || token === 'null' || token === '') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div
        style={{
          maxWidth: 900,
          margin: '20px auto',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <h1 style={{ textAlign: 'center' }}>GreenCart Logistics</h1>
        {token && (
          <button
            onClick={(e) => {
              e.preventDefault();
              localStorage.removeItem('token');
              window.location.href = '/login'; // Redirect to login after logout
            }}
            style={{ position: 'absolute', right: 10, top: 10 }}
          >
            logout
          </button>
        )}
        <nav
          style={{
            marginBottom: 30,
            display: 'flex',
            gap: 20,
            justifyContent: 'center'
          }}
        >
          <NavLink to="/" style={linkStyle} end>
            Dashboard
          </NavLink>
          <NavLink to="/simulation" style={linkStyle}>
            Simulation
          </NavLink>
          <NavLink to="/management" style={linkStyle}>
            Management
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route
            path="/management"
            element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

const linkStyle = ({ isActive }) => ({
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: 4,
  backgroundColor: isActive ? '#1976d2' : '#eee',
  color: isActive ? 'white' : '#333'
});
