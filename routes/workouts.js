const express = require('express');
const mysql = require('mysql2');

const router = express.Router({ mergeParams: true });  // Ensures plan_id is passed

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Get all workouts
/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Retrieve a list of all workouts
 *     tags: [Workouts]
 *     responses:
 *       200:
 *         description: A list of workouts
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
 *                   plan_id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Morning Cardio"
 *                   length:
 *                     type: integer
 *                     example: 30
 *                   type:
 *                     type: string
 *                     example: "Cardio"
 *                   frequency:
 *                     type: integer
 *                     example: 3
 */
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM workouts';

    db.query(sql, (err, results) => {
        res.json(results);
    });
});

// Create a workout for a specific plan
/**
 * @swagger
 * /workouts:
 *   post:
 *     summary: Create a new workout for a specific training plan
 *     tags: [Workouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Morning Cardio"
 *               length:
 *                 type: integer
 *                 example: 30
 *               type:
 *                 type: string
 *                 example: "Cardio"
 *               frequency:
 *                 type: integer
 *                 example: 3
 *               plan_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 plan_id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Morning Cardio"
 *                 length:
 *                   type: integer
 *                   example: 30
 *                 type:
 *                   type: string
 *                   example: "Cardio"
 *                 frequency:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: All fields are required
 *       422:
 *         description: Invalid input values
 */
router.post('/', (req, res) => {
    const { name, length, type, frequency, plan_id } = req.body;

    // Check for missing fields
    if (!name || length === undefined || !type || frequency === undefined || !plan_id) {
        return res.status(400).json({ error: 'Invalid payload. All fields are required.' });
    }

    // Combined additional validation for length and frequency
    if (isNaN(length) || length <= 0 || isNaN(frequency) || frequency <= 0) {
        return res.status(422).json({ error: 'Invalid payload. Length and frequency must be positive numbers.' });
    }

    const sql = 'INSERT INTO workouts (plan_id, name, length, type, frequency) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [plan_id, name, length, type, frequency], (err, result) => {
        res.status(201).json({ id: result.insertId, plan_id, name, length, type, frequency });
    });
});


// Get a specific workout by ID
/**
 * @swagger
 * /workouts/{workout_id}:
 *   get:
 *     summary: Retrieve a specific workout by ID
 *     tags: [Workouts]
 *     parameters:
 *       - name: workout_id
 *         in: path
 *         required: true
 *         description: ID of the workout
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A workout found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 plan_id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Morning Cardio"
 *                 length:
 *                   type: integer
 *                   example: 30
 *                 type:
 *                   type: string
 *                   example: "Cardio"
 *                 frequency:
 *                   type: integer
 *                   example: 3
 *       404:
 *         description: Workout not found
 */
router.get('/:workout_id', (req, res) => {
    const { workout_id } = req.params;
    const sql = 'SELECT * FROM workouts WHERE id = ?';

    db.query(sql, [workout_id], (err, results) => {
        if (results.length === 0) {
            return res.status(404).send('Workout not found');
        }
        res.json(results[0]);
    });
});

// Update a workout for a specific plan
/**
 * @swagger
 * /workouts/{workout_id}:
 *   put:
 *     summary: Update a specific workout
 *     tags: [Workouts]
 *     parameters:
 *       - name: workout_id
 *         in: path
 *         required: true
 *         description: ID of the workout
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
 *                 example: "Morning Cardio"
 *               length:
 *                 type: integer
 *                 example: 30
 *               type:
 *                 type: string
 *                 example: "Cardio"
 *               frequency:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *       400:
 *         description: All fields are required
 *       422:
 *         description: Invalid input values
 *       404:
 *         description: Workout not found
 */
router.put('/:workout_id', (req, res) => {
    const { workout_id } = req.params;
    const { name, length, type, frequency } = req.body;

    // Check for missing fields
    if (!name || length === undefined || !type || frequency === undefined) {
        return res.status(400).json({ error: 'Invalid payload. All fields are required.' });
    }

    // Combined additional validation for length and frequency
    if (isNaN(length) || length <= 0 || isNaN(frequency) || frequency <= 0) {
        return res.status(422).json({ error: 'Invalid payload. Length and frequency must be positive numbers.' });
    }

    const sql = 'UPDATE workouts SET name = ?, length = ?, type = ?, frequency = ? WHERE id = ?';

    db.query(sql, [name, length, type, frequency, workout_id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Workout not found');
        }
        res.send('Workout updated successfully');
    });
});

// Delete a workout for a specific plan
/**
 * @swagger
 * /workouts/{workout_id}:
 *   delete:
 *     summary: Delete a specific workout
 *     tags: [Workouts]
 *     parameters:
 *       - name: workout_id
 *         in: path
 *         required: true
 *         description: ID of the workout
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *       404:
 *         description: Workout not found
 */
router.delete('/:workout_id', (req, res) => {
    const { workout_id } = req.params;
    const sql = 'DELETE FROM workouts WHERE id = ?';

    db.query(sql, [workout_id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Workout not found');
        }
        res.send('Workout deleted successfully');
    });
});

module.exports = router;
