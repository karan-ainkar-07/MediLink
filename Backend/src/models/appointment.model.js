import mongoose, {Schema} from "mongoose";

const AppointmentSchema = new Schema(
    {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    date: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["Booked", "Completed", "Cancelled", "In-Progress"], 
      default: "Booked" ,
    },
    time:{
      type:Number, //60* hour + 00 (midnight)
      required:true,
    },
    couponNumber:
    {
        type:Number,
        required:true,
    },
    expectedTime:
    {
        type:Number,
        required:false,
    },
    startTime :
    {
      type:Date,
      required:false,
    },
    isPresent:
    {
      type:Boolean,
      default:false,
    },
    partOfQueue:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Queue",
        required:true,
    },
    prescription:
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Prescription",
    },
    },
 { timestamps: true }
);

export const Appointment= mongoose.model("Appointment", AppointmentSchema);