import mongoose from 'mongoose';
import env from './env';
import logger from '../utils/logger';
import models from '../models';

const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  logger.info(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  // Drop any indexes left over from a previously reused database (e.g. a
  // stray unique index on a field our schema doesn't have) and create any
  // that are missing, so the collection always matches our current models.
  await Promise.all(
    Object.values(models).map((model) =>
      model.syncIndexes().catch((err: Error) => logger.warn(`Index sync failed for ${model.modelName}: ${err.message}`))
    )
  );

  mongoose.connection.on('error', (err: Error) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

export default connectDB;
