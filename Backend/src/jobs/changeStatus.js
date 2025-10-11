import cron from "node-cron"
import { Appointment } from "../models/appointment.model"

export const cancelAppointment=async()=>{
    const date = new Date();
    date.setHours(4,0,0,0);
    const result= await Appointment.updateMany(
        { expiry:{ $lt:date } , status: { $ne:"Cancelled"} },
        { $set: { status: "Cancelled" }}
    );
  console.log(`✅ Updated ${result.modifiedCount} appointments to Cancelled`);
}