import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate hook

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if both passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setError(''); // Reset error state if validation passes

    try {
      // Sending the registration request to your backend
      const response = await fetch('https://sport-plans.onrender.com/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful registration, show success message and redirect to home page (/)
        setMessage(data.message);
        // Redirect to home page after 2 seconds
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Show the error message if registration fails
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div>
          <h2>Register</h2>
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
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <div>
          <button type="submit" className="register-button">Register</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
