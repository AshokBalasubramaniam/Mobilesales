import mongoose, { Schema } from "mongoose";
import { NOTIFICATION_TYPE } from "../config/constants";
import type { INotification } from "../types/models";

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
