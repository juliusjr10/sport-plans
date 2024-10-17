const express = require('express');
const mysql = require('mysql2');

// Create a router
const router = express.Router({ mergeParams: true });  // Ensure workout_id is passed

// MySQL connection (Make sure to update the connection with your config)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Create a new exercise
router.post('/', (req, res) => {
    const { workout_id } = req.params;
    const { name, sets, reps, restTime, tips } = req.body;
    const sql = 'INSERT INTO exercises (name, sets, reps, restTime, tips, workout_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, sets, reps, restTime, tips, workout_id], (err, result) => {
        if (err) {
            console.error('Error inserting exercise:', err);
            return res.status(500).send('Error inserting exercise');
        }
        res.status(201).json({ id: result.insertId, name, sets, reps, restTime, tips, workout_id });
    });
});

// Get all exercises for a specific workout
router.get('/exercises', (req, res) => {
    const { workout_id } = req.params;
    const sql = 'SELECT * FROM exercises WHERE workout_id = ?';

    db.query(sql, [workout_id], (err, results) => {
        if (err) {
            console.error('Error fetching exercises:', err);
            return res.status(500).send('Error fetching exercises');
        }
        res.json(results);
    });
});

// Get a specific exercise by ID
router.get('/:exercise_id', (req, res) => {
    const { workout_id, exercise_id } = req.params;
    const sql = 'SELECT * FROM exercises WHERE id = ? AND workout_id = ?';

    db.query(sql, [exercise_id, workout_id], (err, results) => {
        if (err) {
            console.error('Error fetching exercise:', err);
            return res.status(500).send('Error fetching exercise');
        }
        if (results.length === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.json(results[0]);
    });
});

// Update an exercise for a specific workout
router.put('/:exercise_id', (req, res) => {
    const { workout_id, exercise_id } = req.params;
    const { name, sets, reps, restTime, tips } = req.body;
    const sql = 'UPDATE exercises SET name = ?, sets = ?, reps = ?, restTime = ?, tips = ? WHERE id = ? AND workout_id = ?';

    db.query(sql, [name, sets, reps, restTime, tips, exercise_id, workout_id], (err, result) => {
        if (err) {
            console.error('Error updating exercise:', err);
            return res.status(500).send('Error updating exercise');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.send('Exercise updated successfully');
    });
});

// Delete an exercise for a specific workout
router.delete('/:exercise_id', (req, res) => {
    const { workout_id, exercise_id } = req.params;
    const sql = 'DELETE FROM exercises WHERE id = ? AND workout_id = ?';

    db.query(sql, [exercise_id, workout_id], (err, result) => {
        if (err) {
            console.error('Error deleting exercise:', err);
            return res.status(500).send('Error deleting exercise');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.send('Exercise deleted successfully');
    });
});

module.exports = router;
