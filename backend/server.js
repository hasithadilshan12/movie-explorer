require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('The API will keep running, but database routes will fail.');
  }

  app.listen(PORT, () => {
    console.log(`Movie Explorer API running on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
