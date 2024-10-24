const express = require('express');
const mysql = require('mysql2');

const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Create a new plan
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
 *         description: All fields are required title, length, coach, description.
 *       422:
 *         description: Length must be a positive number.
 */
router.post('/', (req, res) => {
    const { title, length, coach, description } = req.body;

    // Check for missing fields
    if (!title || length === undefined || !coach || !description) {
        return res.status(400).json({ error: 'All fields are required: title, length, coach, description.' });
    }

    // Additional validation for length
    if (isNaN(length) || length <= 0) {
        return res.status(422).json({ error: 'Length must be a positive number.' });
    }

    const sql = 'INSERT INTO plans (title, length, coach, description) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [title, length, coach, description], (err, result) => {
        res.status(201).json({ id: result.insertId, title, length, coach, description });
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
 */
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM plans';

    db.query(sql, (err, results) => {
        res.json(results);
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
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM plans WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (results.length === 0) {
            return res.status(404).send('Plan not found');
        }
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
 *       404:
 *         description: Plan not found
 */
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, length, coach, description } = req.body;

    // Check for missing fields
    if (!title || length === undefined || !coach || !description) {
        return res.status(400).json({ error: 'All fields are required: title, length, coach, description.' });
    }

    // Additional validation for length
    if (isNaN(length) || length <= 0) {
        return res.status(422).json({ error: 'Length must be a positive number.' });
    }

    const sql = 'UPDATE plans SET title = ?, length = ?, coach = ?, description = ? WHERE id = ?';

    db.query(sql, [title, length, coach, description, id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Plan not found');
        }
        res.send('Plan updated successfully');
    });
});

// Delete a plan
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
 */
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM plans WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send('Plan not found');
        }
        res.send('Plan deleted successfully');
    });
});

/**
 * @swagger
 * /plans/{plan_id}/workouts:
 *   get:
 *     summary: Retrieve all workouts for a specific training plan
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
 */

router.get('/:plan_id/workouts', (req, res) => {
    const { plan_id } = req.params;

    // First, check if the plan exists
    const checkPlanSql = 'SELECT * FROM plans WHERE id = ?';
    
    db.query(checkPlanSql, [plan_id], (err, planResults) => {
        
        if (planResults.length === 0) {
            // Plan not found
            return res.status(404).json({ message: 'Plan not found' });
        }
        
        // Plan exists, now fetch the workouts
        const sql = 'SELECT * FROM workouts WHERE plan_id = ?';
        
        db.query(sql, [plan_id], (err, workoutResults) => {
            
            res.json(workoutResults);
        });
    });
});


// Export the router
module.exports = router;
