import mongoose, { Schema } from "mongoose";

const userInfoSchema= new Schema(
    {
        Address:
        {
            type:String,
            required:true,
        },
        LatLon:
        {
            type:String,
            required:true,
        },
        medicalHistories: 
        [
            { 
                type: mongoose.Schema.Types.ObjectId,
                 ref: "MedicalHistory" 
            }
        ]

    }
)