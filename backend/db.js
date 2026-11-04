const mongoose = require('mongoose');

let connectionPromise = null;

/**
 * Connect to MongoDB and reuse the connection across warm serverless
 * invocations. Calling this on every request is safe: it is a no-op once the
 * connection is established.
 */
function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((instance) => instance.connection)
      .catch((err) => {
        // Allow the next request to retry instead of caching the failure.
        connectionPromise = null;
        throw err;
      });
  }

  return connectionPromise;
}

module.exports = { connectDB };
