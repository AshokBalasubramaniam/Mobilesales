import http from 'http';
import app from './app';
import env from './config/env';
import connectDB from './config/db';
import { initSocketIO } from './sockets';
import logger from './utils/logger';

const start = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocketIO(httpServer);

  httpServer.listen(env.port, () => {
    logger.info(`Mobile Sales API running on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down gracefully`);
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
