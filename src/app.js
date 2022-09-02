const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();


// Middlewares
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());


// Routes


module.exports = app;