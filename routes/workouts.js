const express = require('express');
const mysql = require('mysql2');

// Create a router
const router = express.Router({ mergeParams: true });  // Ensures plan_id is passed

// MySQL connection (Make sure to update the connection with your config)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Create a workout for a specific plan
router.post('/', (req, res) => {
    const { plan_id } = req.params;  // Now we get plan_id from the parent route
    const { name, length, type, frequency } = req.body;
    const sql = 'INSERT INTO workouts (plan_id, name, length, type, frequency) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [plan_id, name, length, type, frequency], (err, result) => {
        if (err) {
            console.error('Error inserting workout:', err);
            return res.status(500).send('Error inserting workout');
        }
        res.status(201).json({ id: result.insertId, plan_id, name, length, type, frequency });
    });
});

// Get all workouts for a specific plan
router.get('/workouts', (req, res) => {
    const { plan_id } = req.params;
    const sql = 'SELECT * FROM workouts WHERE plan_id = ?';

    db.query(sql, [plan_id], (err, results) => {
        if (err) {
            console.error('Error fetching workouts:', err);
            return res.status(500).send('Error fetching workouts');
        }
        res.json(results);
    });
});

// Get a specific workout by ID
router.get('/:workout_id', (req, res) => {
    const { plan_id, workout_id } = req.params;
    const sql = 'SELECT * FROM workouts WHERE id = ? AND plan_id = ?';

    db.query(sql, [workout_id, plan_id], (err, results) => {
        if (err) {
            console.error('Error fetching workout:', err);
            return res.status(500).send('Error fetching workout');
        }
        if (results.length === 0) {
            return res.status(404).send('Workout not found');
        }
        res.json(results[0]);
    });
});

// Update a workout for a specific plan
router.put('/:workout_id', (req, res) => {
    const { plan_id, workout_id } = req.params;
    const { name, length, type, frequency } = req.body;
    const sql = 'UPDATE workouts SET name = ?, length = ?, type = ?, frequency = ? WHERE id = ? AND plan_id = ?';

    db.query(sql, [name, length, type, frequency, workout_id, plan_id], (err, result) => {
        if (err) {
            console.error('Error updating workout:', err);
            return res.status(500).send('Error updating workout');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Workout not found');
        }
        res.send('Workout updated successfully');
    });
});

// Delete a workout for a specific plan
router.delete('/:workout_id', (req, res) => {
    const { plan_id, workout_id } = req.params;
    const sql = 'DELETE FROM workouts WHERE id = ? AND plan_id = ?';

    db.query(sql, [workout_id, plan_id], (err, result) => {
        if (err) {
            console.error('Error deleting workout:', err);
            return res.status(500).send('Error deleting workout');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Workout not found');
        }
        res.send('Workout deleted successfully');
    });
});

module.exports = router;
