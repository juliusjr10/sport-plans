const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const TokenManager = require('../middleware/TokenManager');

const router = express.Router();

// Initialize MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const tokenManager = new TokenManager(process.env.JWT_SECRET, '1h');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint allows a user to register by providing a username and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully."
 *                 token:
 *                   type: string
 *                   description: The JWT token for the authenticated user.
 *       400:
 *         description: Bad request (e.g., missing username or password)
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sqlInsert = `
            INSERT INTO users (username, password, role)
            VALUES (?, ?, 'user')
        `;

        db.query(sqlInsert, [username, hashedPassword], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Username already exists.' });
                }
                return res.status(500).json({ message: 'Database error.', error: err });
            }

            const token = tokenManager.generateToken({
                id: results.insertId,
                username,
                role: 'user',
            });

            return res.status(201).json({ message: 'User registered successfully.', token });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error.', error });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: This endpoint allows a user to login using their username and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful."
 *                 token:
 *                   type: string
 *                   description: The JWT token for the authenticated user.
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const sqlSelect = 'SELECT * FROM users WHERE username = ?';
    db.query(sqlSelect, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        const token = tokenManager.generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
        });

        return res.status(200).json({ message: 'Login successful.', token });
    });
});

/**
 * @swagger
 * /renew:
 *   post:
 *     summary: Renew the access token
 *     description: This endpoint allows a user to renew their access token using a valid refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The refresh token to be used for generating a new access token.
 *     responses:
 *       200:
 *         description: Token successfully renewed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token renewed successfully."
 *                 token:
 *                   type: string
 *                   description: The newly generated JWT token.
 *       400:
 *         description: Missing or invalid token
 *       401:
 *         description: Invalid or expired token
 */
router.post('/renew', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const newToken = tokenManager.renewToken(token);

        return res.status(200).json({ message: 'Token renewed successfully.', token: newToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
    }
});

module.exports = router;
