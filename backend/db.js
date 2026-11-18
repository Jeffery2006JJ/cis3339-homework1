import mongoose from 'mongoose';
import Student from './models/Student.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

/**
 * Connects to MongoDB and makes sure every collection and index exists.
 * Works against an empty or non-existent database: MongoDB creates the
 * database on first write, and Model.init() creates the collections and
 * builds the unique indexes declared in the schemas.
 */
export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Check the .env file in the project root.');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected.'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected.'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Create collections + indexes (unique student IDs, course IDs, enrollments).
  await Promise.all([Student.init(), Course.init(), Enrollment.init()]);

  const { name, host, port } = mongoose.connection;
  console.log(`Connected to MongoDB database "${name}" at ${host}:${port}`);
}

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
