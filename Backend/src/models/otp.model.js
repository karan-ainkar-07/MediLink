import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  code: { type: String, required: true },   
  type: { type: String, enum: ["email", "phone"], required: true },
  expiresAt: { type: Date, required: true }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export  const Otp= mongoose.model("Otp", otpSchema);
