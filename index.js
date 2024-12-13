// index.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Import yamljs for Swagger
const fs = require('fs'); // File system module for file operations
const cors = require('cors');

// Create an Express application
const app = express();
const allowedOrigins = ['http://localhost:3001', 'https://sport-plans-frontend.onrender.com'];
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: 'GET,POST,PUT,DELETE',  // Allow specific HTTP methods
    allowedHeaders: 'Content-Type, Authorization',  // Allow specific headers
}));

// MySQL connection setup using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Public IP address of the Google Cloud SQL instance
    user: process.env.DB_USER,       // Username for your MySQL database
    password: process.env.DB_PASSWORD, // Password for the MySQL user
    database: process.env.DB_NAME,   // Database name to connect to
    port: process.env.DB_PORT,       // MySQL default port (3306)
});

// Connecting to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Swagger API Documentation Setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for plans, workouts, and exercises.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`, // Adjust this for deployment
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

// Initialize Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve YAML documentation
app.get('/api-docs.yaml', (req, res) => {
    const yamlString = YAML.stringify(swaggerDocs, 4); // Convert swaggerDocs to YAML format
    res.header('Content-Type', 'application/x-yaml');
    res.send(yamlString);
});

// Optional: Generate and save the YAML documentation to a file
const generateSwaggerYaml = () => {
    const yamlString = YAML.stringify(swaggerDocs, 4);
    fs.writeFileSync('./swagger.yaml', yamlString); // Write to swagger.yaml file
    console.log('YAML documentation generated at swagger.yaml');
};

// Call the function to generate the YAML file on server start
generateSwaggerYaml();

// Import routes for your API
const plansRoutes = require('./routes/plans'); 
const workoutsRoutes = require('./routes/workouts');  
const exercisesRoutes = require('./routes/exercises');
const usersRoutes = require('./routes/users');

// Use routes
app.use('/plans', plansRoutes);
app.use('/workouts', workoutsRoutes);
app.use('/exercises', exercisesRoutes);
app.use('/users', usersRoutes);

// Simple test route to check if the server is running
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
