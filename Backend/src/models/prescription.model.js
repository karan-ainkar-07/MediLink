import mongoose, { mongo, Schema } from "mongoose";

const prescriptionSchema = new Schema(
    {
            appointment:
            {
              type:mongoose.Schema.Types.ObjectId,
              ref:"Appointment",
            },
            notes: { type: String },
            diagnoses: [
              {
                condition: { type: String, required: true },   
                icdCode: { type: String }                      
              }
            ],
            medicines: [
              {
                name: { type: String, required: true },         
                dosage: { type: Number, required: true }, 
                frequency:
                {
                  type:[String], 
                  enum:["EarlyMorning","Morning","Noon","Afternoon","Evening","Night"],
                  required:true,
                },
                duration: { type: Number, required: true },      
              }
            ],
            isNotificationsOn:
            {
                type:Boolean,
                default:false,
            },
            startDate:
            {
                type:Date,
            },
            endDate:
            {
                type:Date,
            },
    }
)

export const Prescription = mongoose.model("Prescription",prescriptionSchema);