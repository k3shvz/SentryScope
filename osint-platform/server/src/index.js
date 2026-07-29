import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Add it to server/.env before running.');
  process.exit(1);
}

// Defense in depth: a bug in one request handler (e.g. an unexpected error
// thrown inside a raw callback, outside Express's own try/catch machinery)
// should not take the entire API down for every other user. Log it loudly
// so it still gets noticed and fixed, but keep the process alive rather than
// crashing on every stray exception.
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION (server kept running):', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION (server kept running):', reason);
});

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('FATAL: Could not connect to MongoDB.', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`SentryScope API listening on http://localhost:${PORT}`);
  });
}

start();
