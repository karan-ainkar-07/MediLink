import mongoose from "mongoose";

const AppointmentSchema = new Schema(
    {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["Booked", "Completed", "Cancelled"], 
      default: "Booked" ,
    },
    prescription:
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"prescription",
    }
    },
 { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);