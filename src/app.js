const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());

// Routes
app.use('/api', require('./routes/authRoute'));

module.exports = app;
