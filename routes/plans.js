const express = require('express');
const mysql = require('mysql2');

// Create a router
const router = express.Router();

// MySQL connection (Make sure to update the connection with your config)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Create a new plan
router.post('/', (req, res) => {
    const { title, length, coach, description } = req.body;
    const sql = 'INSERT INTO plans (title, length, coach, description) VALUES (?, ?, ?, ?)';

    db.query(sql, [title, length, coach, description], (err, result) => {
        if (err) {
            console.error('Error inserting plan:', err);
            return res.status(500).send('Error inserting plan');
        }
        res.status(201).json({ id: result.insertId, title, length, coach, description });
    });
});

// Get all plans
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM plans';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching plans:', err);
            return res.status(500).send('Error fetching plans');
        }
        res.json(results);
    });
});

// Get a specific plan by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM plans WHERE id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching plan:', err);
            return res.status(500).send('Error fetching plan');
        }
        if (results.length === 0) {
            return res.status(404).send('Plan not found');
        }
        res.json(results[0]);
    });
});

// Update a plan
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, length, coach, description} = req.body;
    const sql = 'UPDATE plans SET title = ?, length = ?, coach = ?, description = ? WHERE id = ?';

    db.query(sql, [title, length, coach, description, id], (err, result) => {
        if (err) {
            console.error('Error updating plan:', err);
            return res.status(500).send('Error updating plan');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Plan not found');
        }
        res.send('Plan updated successfully');
    });
});

// Delete a plan
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM plans WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting plan:', err);
            return res.status(500).send('Error deleting plan');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Plan not found');
        }
        res.send('Plan deleted successfully');
    });
});

// Export the router
module.exports = router;
