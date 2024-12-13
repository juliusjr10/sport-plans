// LoginPage.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate hook

  // Check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // If a token exists, redirect to the plans page
      navigate('/plans');
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setError('Username and password are required');
    } else {
      setError('');
      try {
        // Sending the login request to your backend
        const response = await fetch('https://sport-plans.onrender.com/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Successful login, store the token and show success message
          setMessage(data.message);
          localStorage.setItem('authToken', data.token); // Save the token in localStorage or state
          
          // Redirect the user to the plans page
          navigate('/plans'); // Navigate to the plans page
        } else {
          // Show the error message if login fails
          setError(data.message || 'Login failed. Please try again.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div>
          <h2>Log in</h2>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <div>
           <button type="submit" className="login-button">Login</button>
        </div>

      </form>
    </div>
  );
}

export default LoginPage;
