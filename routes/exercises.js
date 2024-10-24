const express = require('express');
const mysql = require('mysql2');

const router = express.Router({ mergeParams: true });  // Ensure workout_id is passed

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Create a new exercise
/**
 * @swagger
 * /exercises:
 *   post:
 *     summary: Create a new exercise
 *     tags: [Exercises]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Push Up"
 *               sets:
 *                 type: integer
 *                 example: 3
 *               reps:
 *                 type: integer
 *                 example: 15
 *               restTime:
 *                 type: integer
 *                 example: 60
 *               tips:
 *                 type: string
 *                 example: "Keep your back straight."
 *               workout_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Push Up"
 *                 sets:
 *                   type: integer
 *                   example: 3
 *                 reps:
 *                   type: integer
 *                   example: 15
 *                 restTime:
 *                   type: integer
 *                   example: 60
 *                 tips:
 *                   type: string
 *                   example: "Keep your back straight."
 *                 workout_id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: All fields are required
 *       422:
 *         description: Invalid input values
 */
router.post('/', (req, res) => {
    const { name, sets, reps, restTime, tips, workout_id } = req.body;

    // Check for missing fields
    if (!name || sets === undefined || reps === undefined || restTime === undefined || !workout_id) {
        return res.status(400).json({ error: 'All fields are required: name, sets, reps, restTime, tips, workout_id.' });
    }

    // Additional validation
    if (isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(restTime) || restTime < 0 || isNaN(workout_id)) {
        return res.status(422).json({ error: 'Sets and reps must be positive numbers, rest time must be zero or a positive number, and workout_id must be a valid number.' });
    }

    const sql = 'INSERT INTO exercises (name, sets, reps, restTime, tips, workout_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, sets, reps, restTime, tips, workout_id], (err, result) => {
        res.status(201).json({ id: result.insertId, name, sets, reps, restTime, tips, workout_id });
    });
});

// Get all exercises for a specific workout
/**
 * @swagger
 * /exercises:
 *   get:
 *     summary: Get all exercises
 *     tags: [Exercises]
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Push Up"
 *                   sets:
 *                     type: integer
 *                     example: 3
 *                   reps:
 *                     type: integer
 *                     example: 15
 *                   restTime:
 *                     type: integer
 *                     example: 60
 *                   tips:
 *                     type: string
 *                     example: "Keep your back straight."
 *                   workout_id:
 *                     type: integer
 *                     example: 1
 */
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM exercises';

    db.query(sql, (err, results) => {
        res.json(results);
    });
});

// Get a specific exercise by ID
/**
 * @swagger
 * /exercises/{exercise_id}:
 *   get:
 *     summary: Get a specific exercise
 *     tags: [Exercises]
 *     parameters:
 *       - name: exercise_id
 *         in: path
 *         required: true
 *         description: ID of the exercise
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Exercise found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Push Up"
 *                 sets:
 *                   type: integer
 *                   example: 3
 *                 reps:
 *                   type: integer
 *                   example: 15
 *                 restTime:
 *                   type: integer
 *                   example: 60
 *                 tips:
 *                   type: string
 *                   example: "Keep your back straight."
 *                 workout_id:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Exercise not found
 */
router.get('/:exercise_id', (req, res) => {
    const { exercise_id } = req.params;
    const sql = 'SELECT * FROM exercises WHERE id = ?';

    db.query(sql, [exercise_id], (err, results) => {
        if (results.length === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.json(results[0]);
    });
});

// Update an exercise for a specific workout
/**
 * @swagger
 * /exercises/{exercise_id}:
 *   put:
 *     summary: Update an exercise
 *     tags: [Exercises]
 *     parameters:
 *       - name: exercise_id
 *         in: path
 *         required: true
 *         description: ID of the exercise
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Push Up"
 *               sets:
 *                 type: integer
 *                 example: 3
 *               reps:
 *                 type: integer
 *                 example: 15
 *               restTime:
 *                 type: integer
 *                 example: 60
 *               tips:
 *                 type: string
 *                 example: "Keep your back straight."
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *       400:
 *         description: All fields are required
 *       404:
 *         description: Exercise not found
 *       422:
 *         description: Invalid input values
 */
router.put('/:exercise_id', (req, res) => {
    const { exercise_id } = req.params;
    const { name, sets, reps, restTime, tips } = req.body;

    // Check for missing fields
    if (!name || sets === undefined || reps === undefined || restTime === undefined) {
        return res.status(400).json({ error: 'All fields are required: name, sets, reps, restTime, and tips.' });
    }

    // Additional validation
    if (isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(restTime) || restTime < 0) {
        return res.status(422).json({ error: 'Sets and reps must be positive numbers, and rest time must be zero or a positive number.' });
    }

    const sql = 'UPDATE exercises SET name = ?, sets = ?, reps = ?, restTime = ?, tips = ? WHERE id = ?';
    
    db.query(sql, [name, sets, reps, restTime, tips, exercise_id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.send('Exercise updated successfully');
    });
});

// Delete an exercise for a specific workout
/**
 * @swagger
 * /exercises/{exercise_id}:
 *   delete:
 *     summary: Delete an exercise
 *     tags: [Exercises]
 *     parameters:
 *       - name: exercise_id
 *         in: path
 *         required: true
 *         description: ID of the exercise
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Exercise deleted successfully
 *       404:
 *         description: Exercise not found
 */
router.delete('/:exercise_id', (req, res) => {
    const { exercise_id } = req.params;
    const sql = 'DELETE FROM exercises WHERE id = ?';

    db.query(sql, [exercise_id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Exercise not found');
        }
        res.send('Exercise deleted successfully');
    });
});

module.exports = router;
