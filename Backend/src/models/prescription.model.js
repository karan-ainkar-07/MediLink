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
                duration: { type: String, required: true },     
                instructions: { type: String }                  
              }
            ],
            isNotificationsOn:
            {
                type:Boolean,
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

export default Prescription = mongoose.model("Prescription",prescriptionSchema);