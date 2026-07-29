import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { generalLimiter, authLimiter } from './config/rateLimiters.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        // Investigation results render avatars/logos pulled from Gravatar
        // and other third-party OSINT sources, so images need to be allowed
        // from any https origin, not just same-origin.
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const clientBuildPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api', apiRoutes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return notFoundHandler(req, res);
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
