import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(
        'https://greencart-logistics-backend-d21p.onrender.com/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      navigate('/management');
    } catch (err) {
      setError('Network error');
      console.error(err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '60px auto',
        padding: 30,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1976d2' }}>
        Admin Login
      </h2>
      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: '12px 16px',
            borderRadius: 6,
            border: '1.5px solid #ccc',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '12px 16px',
            borderRadius: 6,
            border: '1.5px solid #ccc',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1976d2')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />
        <button
          type="submit"
          style={{
            padding: '12px 0',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#1976d2',
            color: '#fff',
            fontSize: 18,
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(25, 118, 210, 0.5)',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#115293')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
        >
          Login
        </button>
        {error && (
          <p
            style={{
              color: '#d32f2f',
              textAlign: 'center',
              marginTop: 10,
              fontWeight: '600'
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
