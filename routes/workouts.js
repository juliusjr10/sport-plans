const express = require('express');
const mysql = require('mysql2');
const authenticateToken = require('../middleware/authenticateToken');

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
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Access denied. No token provided.
 *       403:
 *         description: Access denied. You do not have the required permissions.
 */
router.get('/workouts', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM workouts';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving workouts.' });
        }
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
 *       403:
 *         description: Access denied. You are not authorized to create a workout for this plan.
 */
router.post('/', authenticateToken, (req, res) => {
    const { name, length, type, frequency, plan_id } = req.body;

    // Check for missing fields
    if (!name || length === undefined || !type || frequency === undefined || !plan_id) {
        return res.status(400).json({ error: 'Invalid payload. All fields are required.' });
    }

    // Combined additional validation for length and frequency
    if (isNaN(length) || length <= 0 || isNaN(frequency) || frequency <= 0) {
        return res.status(422).json({ error: 'Invalid payload. Length and frequency must be positive numbers.' });
    }

    // Check if the user has permission to create a workout for this plan
    const sqlCheckPlanOwnership = 'SELECT user_id FROM plans WHERE id = ?';
    
    db.query(sqlCheckPlanOwnership, [plan_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while checking plan ownership.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Plan not found.' });
        }

        const planOwnerId = results[0].user_id;
        
        // Check if the user is the plan owner or is an admin
        if (req.user.role !== 'admin' && req.user.id !== planOwnerId) {
            return res.status(403).json({ error: 'Access denied. You are not authorized to create a workout for this plan.' });
        }

        const sql = 'INSERT INTO workouts (plan_id, name, length, type, frequency) VALUES (?, ?, ?, ?, ?)';
        
        db.query(sql, [plan_id, name, length, type, frequency], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error creating workout.' });
            }

            return res.status(201).json({
                id: result.insertId,
                plan_id,
                name,
                length,
                type,
                frequency
            });
        });
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
 *       403:
 *         description: Access denied. You are not authorized to view this workout.
 */
router.get('/:workout_id', authenticateToken, (req, res) => {
    const { workout_id } = req.params;

    const sql = 'SELECT * FROM workouts WHERE id = ?';

    db.query(sql, [workout_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = results[0];

        return res.status(200).json(workout);
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
 *       403:
 *         description: Access denied. You do not have permission to update this workout.
 */
router.put('/:workout_id', authenticateToken, (req, res) => {
    const { workout_id } = req.params;
    const { name, length, type, frequency } = req.body;

    // Check for missing fields
    if (!name || length === undefined || !type || frequency === undefined) {
        return res.status(400).json({ error: 'Invalid payload. All fields are required.' });
    }

    // Additional validation for length and frequency
    if (isNaN(length) || length <= 0 || isNaN(frequency) || frequency <= 0) {
        return res.status(422).json({ error: 'Invalid payload. Length and frequency must be positive numbers.' });
    }

    // First, check if the workout exists
    const sqlGetWorkout = 'SELECT * FROM workouts WHERE id = ?';
    db.query(sqlGetWorkout, [workout_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = results[0];

        // Now, check if the plan exists and get its user_id
        const sqlGetPlan = 'SELECT user_id FROM plans WHERE id = ?';
        db.query(sqlGetPlan, [workout.plan_id], (err, planResults) => {
            if (err) {
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            if (planResults.length === 0) {
                return res.status(404).json({ message: 'Plan not found' });
            }

            const plan = planResults[0];

            // Check if the user is an admin or the owner of the plan
            if (req.user.role !== 'admin' && req.user.id !== plan.user_id) {
                return res.status(403).json({ message: 'Access denied. You do not have permission to update this workout.' });
            }

            // Proceed to update the workout if authorized
            const sqlUpdateWorkout = 'UPDATE workouts SET name = ?, length = ?, type = ?, frequency = ? WHERE id = ?';
            db.query(sqlUpdateWorkout, [name, length, type, frequency, workout_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error.', error: err });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Workout not found' });
                }

                return res.status(200).json({ message: 'Workout updated successfully' });
            });
        });
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
 *       403:
 *         description: Access denied. You do not have permission to delete this workout.
 */
router.delete('/:workout_id', authenticateToken, (req, res) => {
    const { workout_id } = req.params;

    // Check if the workout exists
    const sqlGetWorkout = 'SELECT * FROM workouts WHERE id = ?';
    db.query(sqlGetWorkout, [workout_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = results[0];

        // Now, check if the plan exists and get its user_id
        const sqlGetPlan = 'SELECT user_id FROM plans WHERE id = ?';
        db.query(sqlGetPlan, [workout.plan_id], (err, planResults) => {
            if (err) {
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            if (planResults.length === 0) {
                return res.status(404).json({ message: 'Plan not found' });
            }

            const plan = planResults[0];

            // Check if the user is an admin or the owner of the plan
            if (req.user.role !== 'admin' && req.user.id !== plan.user_id) {
                return res.status(403).json({ message: 'Access denied. You do not have permission to delete this workout.' });
            }

            // Proceed to delete the workout if authorized
            const sqlDeleteWorkout = 'DELETE FROM workouts WHERE id = ?';
            db.query(sqlDeleteWorkout, [workout_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error.', error: err });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Workout not found' });
                }

                return res.status(200).json({ message: 'Workout deleted successfully' });
            });
        });
    });
});
// Get all exercises for a specific workout
/**
 * @swagger
 * /workouts/{workout_id}/exercises:
 *   get:
 *     summary: Retrieve a list of all exercises for a specific workout
 *     tags: [Exercises]
 *     parameters:
 *       - name: workout_id
 *         in: path
 *         required: true
 *         description: ID of the workout to get exercises for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of exercises for the specified workout
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
 *                   workout_id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Push-up"
 *                   sets:
 *                     type: integer
 *                     example: 3
 *                   reps:
 *                     type: integer
 *                     example: 15
 *       404:
 *         description: No exercises found for the specified workout
 *       403:
 *         description: Access denied. You are not authorized to view these exercises.
 */
router.get('/:workout_id/exercises', authenticateToken, (req, res) => {
    const { workout_id } = req.params;

    const sql = 'SELECT * FROM exercises WHERE workout_id = ?';

    db.query(sql, [workout_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }


        return res.status(200).json(results);
    });
});

module.exports = router;
