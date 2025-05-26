import mongoose, { Schema } from "mongoose";

export interface ISuspiciousID {
  ip: string;
  reason?: string;
  createdAt: Date;
}

const SuspiciousIDSchema = new Schema<ISuspiciousID>({
  ip: { type: String, required: true, unique: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const SuspiciousID =
  mongoose.models.SuspiciousID ||
  mongoose.model("SuspiciousID", SuspiciousIDSchema);

export default SuspiciousID;
