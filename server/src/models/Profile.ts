import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema({
  name: { type: String, required: true }, age: { type: Number, required: true }, photo: { type: String, required: true },
  bio: { type: String, required: true }, location: { type: String, required: true }, interests: { type: [String], required: true },
  likedCurrentUser: { type: Boolean, default: false, select: false }
}, { timestamps: true });

export const Profile = mongoose.models.Profile ?? mongoose.model("Profile", profileSchema);
