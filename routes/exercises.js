const express = require('express');
const mysql = require('mysql2');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

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
 *       403:
 *         description: Access denied. You do not have permission to create this exercise.
 */
router.post('/', authenticateToken, (req, res) => {
    const { name, sets, reps, restTime, tips, workout_id } = req.body;

    // Check for missing fields
    if (!name || sets === undefined || reps === undefined || restTime === undefined || !workout_id) {
        return res.status(400).json({ error: 'All fields are required: name, sets, reps, restTime, tips, workout_id.' });
    }

    // Additional validation
    if (isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(restTime) || restTime < 0 || isNaN(workout_id)) {
        return res.status(422).json({ error: 'Sets and reps must be positive numbers, rest time must be zero or a positive number, and workout_id must be a valid number.' });
    }

    // Check if the workout exists and retrieve the plan_id associated with it
    const sqlGetWorkout = 'SELECT plan_id FROM workouts WHERE id = ?';
    db.query(sqlGetWorkout, [workout_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = results[0];
        const plan_id = workout.plan_id;

        // Now, check if the plan exists and get its user_id
        const sqlGetPlan = 'SELECT user_id FROM plans WHERE id = ?';
        db.query(sqlGetPlan, [plan_id], (err, planResults) => {
            if (err) {
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            if (planResults.length === 0) {
                return res.status(404).json({ message: 'Plan not found' });
            }

            const plan = planResults[0];

            // Check if the user is an admin or the owner of the plan
            if (req.user.role !== 'admin' && req.user.id !== plan.user_id) {
                return res.status(403).json({ message: 'Access denied. You do not have permission to create this exercise.' });
            }

            // Proceed to create the exercise if authorized
            const sqlCreateExercise = 'INSERT INTO exercises (name, sets, reps, restTime, tips, workout_id) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sqlCreateExercise, [name, sets, reps, restTime, tips, workout_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error.', error: err });
                }

                return res.status(201).json({
                    id: result.insertId,
                    name,
                    sets,
                    reps,
                    restTime,
                    tips,
                    workout_id
                });
            });
        });
    });
});


// Get all exercises
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
 *       500:
 *         description: Internal server error
 *       403:
 *         description: Access denied. You do not have the required permissions.
 */
router.get('/', authenticateToken, (req, res) => {
    // Check if the user is an admin or user (both are allowed)
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. You do not have the required permissions.' });
    }

    const sql = 'SELECT * FROM exercises';

    db.query(sql, (err, results) => {
        if (err) {
            // Handle database error and send a response
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch exercises' });
        }

        // If no error, send the results
        res.status(200).json(results);
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
 *       403:
 *         description: Access denied. You do not have the required permissions.
 */
router.get('/:exercise_id', authenticateToken, (req, res) => {
    // Ensure the user is either an admin or a regular user
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. You do not have the required permissions.' });
    }

    const { exercise_id } = req.params;
    const sql = 'SELECT * FROM exercises WHERE id = ?';

    db.query(sql, [exercise_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch exercise' });
        }

        if (results.length === 0) {
            return res.status(404).send('Exercise not found');
        }

        res.status(200).json(results[0]);
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
 *       403:
 *         description: Access denied. You are not the owner of the plan or an admin.
 */
router.put('/:exercise_id', authenticateToken, (req, res) => {
    const { exercise_id } = req.params;
    const { name, sets, reps, restTime, tips } = req.body;

    // Ensure user is authenticated and authorized (plan owner or admin)
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check for missing fields
    if (!name || sets === undefined || reps === undefined || restTime === undefined) {
        return res.status(400).json({ error: 'All fields are required: name, sets, reps, restTime, and tips.' });
    }

    // Additional validation
    if (isNaN(sets) || sets <= 0 || isNaN(reps) || reps <= 0 || isNaN(restTime) || restTime < 0) {
        return res.status(422).json({ error: 'Sets and reps must be positive numbers, and rest time must be zero or a positive number.' });
    }

    // First, get the workout linked to the exercise
    const sql = 'SELECT workout_id FROM exercises WHERE id = ?';
    db.query(sql, [exercise_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch exercise' });
        }

        if (results.length === 0) {
            return res.status(404).send('Exercise not found');
        }

        const workoutId = results[0].workout_id;

        // Next, find the plan associated with the workout
        const planSql = 'SELECT plan_id FROM workouts WHERE id = ?';
        db.query(planSql, [workoutId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch workout' });
            }

            if (results.length === 0) {
                return res.status(404).send('Workout not found');
            }

            const planId = results[0].plan_id;

            // Finally, check if the user is the owner of the plan or an admin
            const planOwnerSql = 'SELECT user_id FROM plans WHERE id = ?';
            db.query(planOwnerSql, [planId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch plan' });
                }

                if (results.length === 0) {
                    return res.status(404).send('Plan not found');
                }

                const planOwnerId = results[0].user_id;

                // Check if the current user is the plan owner or an admin
                if (userRole === 'admin' || userId === planOwnerId) {
                    // Proceed to update the exercise
                    const updateSql = 'UPDATE exercises SET name = ?, sets = ?, reps = ?, restTime = ?, tips = ? WHERE id = ?';
                    db.query(updateSql, [name, sets, reps, restTime, tips, exercise_id], (err, result) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Failed to update exercise' });
                        }

                        if (result.affectedRows === 0) {
                            return res.status(404).send('Exercise not found');
                        }

                        res.send('Exercise updated successfully');
                    });
                } else {
                    // If not the owner or admin, deny access
                    return res.status(403).json({ message: 'Access denied. You are not the owner of the plan or an admin.' });
                }
            });
        });
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
 *       403:
 *         description: Access denied. You are not the owner of the plan or an admin.
 */
router.delete('/:exercise_id', authenticateToken, (req, res) => {
    const { exercise_id } = req.params;
    const userId = req.user.id;  // The ID of the authenticated user
    const userRole = req.user.role; // Role of the user (admin or user)

    const sql = 'SELECT workout_id FROM exercises WHERE id = ?';
    db.query(sql, [exercise_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch exercise' });
        }

        if (results.length === 0) {
            return res.status(404).send('Exercise not found');
        }

        const workoutId = results[0].workout_id;

        const planSql = 'SELECT plan_id FROM workouts WHERE id = ?';
        db.query(planSql, [workoutId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch workout' });
            }

            if (results.length === 0) {
                return res.status(404).send('Workout not found');
            }

            const planId = results[0].plan_id;

            const planOwnerSql = 'SELECT user_id FROM plans WHERE id = ?';
            db.query(planOwnerSql, [planId], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch plan' });
                }

                if (results.length === 0) {
                    return res.status(404).send('Plan not found');
                }

                const planOwnerId = results[0].user_id;

                if (userRole === 'admin' || userId === planOwnerId) {
                    const deleteSql = 'DELETE FROM exercises WHERE id = ?';
                    db.query(deleteSql, [exercise_id], (err, result) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Failed to delete exercise' });
                        }

                        if (result.affectedRows === 0) {
                            return res.status(404).send('Exercise not found');
                        }

                        res.send('Exercise deleted successfully');
                    });
                } else {
                    return res.status(403).json({ message: 'Access denied. You are not the owner of the plan or an admin.' });
                }
            });
        });
    });
});

module.exports = router;
