import mongoose, { Schema } from 'mongoose';
import type { ISettings } from '../types/models';

const settingsSchema = new Schema<ISettings>(
  {
    emailFrom: { type: String },
    heroBannerUrl: { type: String },
    heroBannerSize: { type: Number },
  },
  { timestamps: true },
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
