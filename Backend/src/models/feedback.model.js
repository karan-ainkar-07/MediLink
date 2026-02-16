import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // change if your patient model name differs
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // prevents multiple feedback entries for same appointment
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    attentiveness: {
      type: String,
      trim: true,
      enum: ["Poor", "Average", "Good", "Very Good", "Excellent", ""],
      default: "",
    },

    explanationOfCondition: {
      type: String,
      trim: true,
      default: "",
    },

    waitingTime: {
      type: String,
      trim: true,
      default: "",
    },

    cleanliness: {
      type: String,
      trim: true,
      default: "",
    },

    staffBehaviour: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);

