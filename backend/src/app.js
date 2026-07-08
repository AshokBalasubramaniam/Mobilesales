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

app.use(helmet());
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
