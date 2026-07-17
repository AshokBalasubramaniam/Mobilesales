import mongoose, { Schema } from 'mongoose';
import type { ISettings } from '../types/models';

const settingsSchema = new Schema<ISettings>(
  {
    emailFrom: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
