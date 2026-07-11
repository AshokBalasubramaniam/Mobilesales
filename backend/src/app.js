const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');
const { xssSanitizer, mongoSanitizer, hpp } = require('./middleware/security.middleware');

const app = express();

app.set('trust proxy', 1);

// Frontend and backend are intentionally served from different domains
// (Netlify + Render). Helmet's default Cross-Origin-Resource-Policy is
// "same-origin", which makes browsers silently refuse to render images
// (and any other static asset) fetched from this API on a different-origin
// page — the request succeeds (200), the image just never paints. These are
// public marketplace listing photos, not sensitive resources, so opening
// this up to cross-origin embedding is the correct and safe setting here.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

app.use(mongoSanitizer);
app.use(xssSanitizer);
app.use(hpp);

app.use(generalLimiter);

// Local disk fallback for uploaded media when S3 isn't configured.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
