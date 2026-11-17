import mongoose, { Schema } from "mongoose";

const swipeSchema = new Schema({
  userId: { type: String, required: true, default: "demo-user" },
  profileId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  direction: { type: String, enum: ["like", "pass"], required: true }
}, { timestamps: true });
swipeSchema.index({ userId: 1, profileId: 1 }, { unique: true });

export const Swipe = mongoose.models.Swipe ?? mongoose.model("Swipe", swipeSchema);
