// swaggerDef.js
const swaggerJSDoc = require('swagger-jsdoc');

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Workout API',
        version: '1.0.0',
        description: 'API documentation for workout plans and workouts',
    },
    servers: [
        {
            url: 'http://localhost:3012/api', // Update this to your API URL
        },
    ],
};

const options = {
    swaggerDefinition,
    // Path to the API docs
    apis: ['./routes/*.js'], // Adjust the path to your route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
