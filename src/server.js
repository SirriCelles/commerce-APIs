const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// DB connection
connectDB();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Kiddle app listening on port ${port}...`);
});
