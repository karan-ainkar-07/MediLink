import mongoose, { mongo, Schema } from "mongoose";

const prescriptionSchema = new Schema(
    {
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
                dosage: { type: String, required: true },       
                frequency: { type: String, required: true },    
                duration: { type: Number, required: true },     
                instructions: { type: String }                  
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