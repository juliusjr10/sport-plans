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
    const { name, sets, reps, restTime, tips, workout_id } = req.body;

    // Check for missing fields
    if (!name || sets === undefined || reps === undefined || restTime === undefined || !workout_id) {
        return res.status(400).json({ error: 'All fields are required: name, sets, reps, restTime, tips, workout_id.' });
    }

    // Additional validation
    if (sets <= 0 || reps <= 0 || restTime < 0) {
        return res.status(422).json({ error: 'Sets and reps must be positive numbers, and rest time must be zero or a positive number.' });
    }

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
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM exercises';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching exercises:', err);
            return res.status(500).send('Error fetching exercises');
        }
        res.json(results);
    });
});

// Get a specific exercise by ID
router.get('/:exercise_id', (req, res) => {
    const {exercise_id } = req.params;
    const sql = 'SELECT * FROM exercises WHERE id = ?';

    db.query(sql, [exercise_id], (err, results) => {
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
    const { exercise_id } = req.params;
    const { name, sets, reps, restTime, tips } = req.body;
    const sql = 'UPDATE exercises SET name = ?, sets = ?, reps = ?, restTime = ?, tips = ? WHERE id = ?';

    db.query(sql, [name, sets, reps, restTime, tips, exercise_id], (err, result) => {
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
    const { exercise_id } = req.params;
    const sql = 'DELETE FROM exercises WHERE id = ?';

    db.query(sql, [exercise_id], (err, result) => {
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
