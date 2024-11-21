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

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a new training plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Beginner Workout Plan"
 *               length:
 *                 type: integer
 *                 example: 30
 *               coach:
 *                 type: string
 *                 example: "John Doe"
 *               description:
 *                 type: string
 *                 example: "A comprehensive plan for beginners."
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Beginner Workout Plan"
 *                 length:
 *                   type: integer
 *                   example: 30
 *                 coach:
 *                   type: string
 *                   example: "John Doe"
 *                 description:
 *                   type: string
 *                   example: "A comprehensive plan for beginners."
 *       400:
 *         description: Missing or invalid fields
 *       403:
 *         description: Forbidden, if the user does not have a valid role to create the plan
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, (req, res) => {
    const { title, length, coach, description } = req.body;

    // Validate required fields
    if (!title || length === undefined || !coach || !description) {
        return res.status(400).json({ error: 'All fields are required: title, length, coach, description.' });
    }

    // Validate length is a positive number
    if (isNaN(length) || length <= 0) {
        return res.status(422).json({ error: 'Length must be a positive number.' });
    }

    // Ensure the user has the right role to create a plan
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You do not have permission to create a plan.' });
    }

    // SQL query to insert a new plan into the database
    const sql = 'INSERT INTO plans (title, length, coach, description, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, length, coach, description, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating plan.', error: err });
        }

        // Log the result of the database query for debugging
        console.log('Inserted Plan:', result);

        // Respond with the created plan details
        return res.status(201).json({
            id: result.insertId,
            title,
            length,
            coach,
            description,
            user_id: req.user.id
        });
    });
});



// Get all plans
/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Retrieve a list of training plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: A list of training plans
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
 *                   title:
 *                     type: string
 *                     example: "Beginner Workout Plan"
 *                   length:
 *                     type: integer
 *                     example: 30
 *                   coach:
 *                     type: string
 *                     example: "John Doe"
 *                   description:
 *                     type: string
 *                     example: "A comprehensive plan for beginners."
 *       403:
 *         description: Forbidden. You do not have the required permissions.
 */
router.get('/', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM plans';

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        res.json(results); // Send the list of plans as a response
    });
});




// Get a specific plan by ID
/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Retrieve a specific training plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the training plan
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A training plan found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Beginner Workout Plan"
 *                 length:
 *                   type: integer
 *                   example: 30
 *                 coach:
 *                   type: string
 *                   example: "John Doe"
 *                 description:
 *                   type: string
 *                   example: "A comprehensive plan for beginners."
 *       404:
 *         description: Plan not found
 */
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM plans WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).send('Plan not found');
        }
        
        // If plan exists, return the plan data
        res.json(results[0]);
    });
});

// Update a plan
/**
 * @swagger
 * /plans/{id}:
 *   put:
 *     summary: Update a specific training plan
 *     tags: [Plans]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the training plan
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Beginner Workout Plan"
 *               length:
 *                 type: integer
 *                 example: 30
 *               coach:
 *                 type: string
 *                 example: "John Doe"
 *               description:
 *                 type: string
 *                 example: "A comprehensive plan for beginners."
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: All fields are required
 *       422:
 *         description: Invalid input values
 *       404:
 *         description: Plan not found
 *       403:
 *         description: Forbidden. You do not have the required permissions to update this plan.
 */
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, length, coach, description } = req.body;
    const userId = req.user.id; // User ID from the JWT token

    // Check for missing fields
    if (!title || length === undefined || !coach || !description) {
        return res.status(400).json({ error: 'All fields are required: title, length, coach, description.' });
    }

    // Additional validation for length
    if (isNaN(length) || length <= 0) {
        return res.status(422).json({ error: 'Length must be a positive number.' });
    }

    // Fetch the plan from the database to check its user_id
    const sqlSelect = 'SELECT * FROM plans WHERE id = ?';
    db.query(sqlSelect, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).send('Plan not found');
        }

        const plan = results[0];

        // Check if the authenticated user is either the creator of the plan or an admin
        if (plan.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You do not have permission to update this plan.' });
        }

        // Update the plan
        const sqlUpdate = 'UPDATE plans SET title = ?, length = ?, coach = ?, description = ? WHERE id = ?';
        db.query(sqlUpdate, [title, length, coach, description, id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Plan not found');
            }

            res.status(200).json({ message: 'Plan updated successfully' });
        });
    });
});


// Delete a specific training plan
/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Delete a specific training plan
 *     tags: [Plans]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the training plan
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 *       403:
 *         description: Access denied. You do not have permission to delete this plan.
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM plans WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).send('Plan not found');
        }

        // Get the plan and check if the user is the creator or an admin
        const plan = results[0];

        // Check if the user is the creator of the plan or an admin
        if (plan.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You do not have permission to delete this plan.' });
        }

        // If the user is the creator or an admin, proceed to delete the plan
        const deleteSql = 'DELETE FROM plans WHERE id = ?';

        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting the plan.', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Plan not found');
            }

            res.status(200).send('Plan deleted successfully');
        });
    });
});
// Get all workouts for a specific plan
/**
 * @swagger
 * /plans/{plan_id}/workouts:
 *   get:
 *     summary: Retrieve all workouts for a specific plan
 *     tags: [Plans]
 *     parameters:
 *       - name: plan_id
 *         in: path
 *         required: true
 *         description: ID of the training plan
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of workouts for the specified plan
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
 *       404:
 *         description: Plan not found
 *       403:
 *         description: Access denied. Only users and admins can access this endpoint.
 */
router.get('/:plan_id/workouts', authenticateToken, (req, res) => {
    const { plan_id } = req.params;

    // Check if the plan exists
    const checkPlanSql = 'SELECT * FROM plans WHERE id = ?';
    
    db.query(checkPlanSql, [plan_id], (err, planResults) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (planResults.length === 0) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Fetch the workouts for the plan
        const sql = 'SELECT * FROM workouts WHERE plan_id = ?';

        db.query(sql, [plan_id], (err, workoutResults) => {
            if (err) {
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            res.json(workoutResults);
        });
    });
});



// Export the router
module.exports = router;
