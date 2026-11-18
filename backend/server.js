import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { connectDatabase, disconnectDatabase, isDatabaseReady } from './db.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import { errorHandler } from './utils/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Load MONGODB_URI and PORT from the committed .env file in the project root.
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
app.use(cors());
app.use(express.json());

// ---------- REST API ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: isDatabaseReady() ? 'connected' : 'disconnected' });
});

// Reject API calls with a clear message if MongoDB is not reachable.
app.use('/api', (_req, res, next) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ error: 'The database is unavailable. Please try again shortly.' });
  }
  next();
});

app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ---------- Vue production build ----------
const hasBuild = fs.existsSync(path.join(DIST_DIR, 'index.html'));
if (hasBuild) {
  app.use(express.static(DIST_DIR));
  // History-mode fallback: any other GET returns index.html so that refreshing
  // a routed page such as /courses does not produce a 404.
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res
      .status(503)
      .type('text')
      .send('The frontend has not been built yet. Run "npm run build", then "npm start".');
  });
}

app.use(errorHandler);

// ---------- Startup ----------
async function start() {
  try {
    await connectDatabase(MONGODB_URI);
  } catch (error) {
    console.error('\nCould not connect to MongoDB.');
    console.error(`  URI: ${MONGODB_URI ?? '(MONGODB_URI not set)'}`);
    console.error(`  Reason: ${error.message}`);
    console.error('  Make sure MongoDB Community Edition is installed and running locally.\n');
    process.exit(1);
  }

  if (!hasBuild) {
    console.warn('Warning: dist/ not found. Run "npm run build" to create the Vue production build.');
  }

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
