const express = require('express');
const mysql = require('mysql2');

// Create an Express application
const app = express();
const port = 3010;

// Middleware to parse JSON bodies
app.use(express.json());

// Load environment variables from .env file
require('dotenv').config();

// MySQL connection configuration
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Import routes
const plansRoutes = require('./routes/plans');  // Already imported
const workoutsRoutes = require('./routes/workouts');  // New import
const exercisesRoutes = require('./routes/exercises');

// Use the imported routes
app.use('/plans', plansRoutes);
app.use('/plans/:plan_id/', workoutsRoutes); // handles `/plans/:plan_id/workouts`
app.use('/plans/:plan_id/:workout_id', exercisesRoutes); // handles `/plans/:plan_id/workouts`
// Basic route for testing
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
