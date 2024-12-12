// index.js
const express = require('express');
const mysql = require('mysql2');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Import yamljs
const fs = require('fs'); // Import fs for file operations
const cors = require('cors');
// Create an Express application
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
require('dotenv').config();
app.use(cors({
    origin: 'http://localhost:3001',  // Allow requests from React app running on port 3001
    methods: 'GET,POST,PUT,DELETE',  // Allow specific HTTP methods if needed
    allowedHeaders: 'Content-Type, Authorization',  // Allow specific headers
  }));
// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Swagger definition
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

// Initialize swagger-jsdoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve swagger documentation
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

// Import routes
const plansRoutes = require('./routes/plans'); 
const workoutsRoutes = require('./routes/workouts');  
const exercisesRoutes = require('./routes/exercises');
const usersRoutes = require('./routes/users');
// Use routes
app.use('/plans', plansRoutes);
app.use('/workouts', workoutsRoutes);
app.use('/exercises', exercisesRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });