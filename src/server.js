const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path: './../.env'});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Romis app listening on port ${port}...`);
});