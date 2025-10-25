import mongoose, { Schema } from "mongoose";

const userInfoSchema= new Schema(
    {
        user:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        address:{
            Line1:
            {
                type:String,
                required:true,
            },
            Line2:
            {
                type:String,
                required:false,
            },
            City:
            {
                type:String,
                required:true
            },
            Country:
            {
                type:String,
                required:true,
            },
            LatLon:
            {
                type:String,
                required:false,
            }
        },
        
        vitals: {
           height: { type: Number, required: false },
           weight: { type: Number, required: false },
           age: { type: Number, required: false },
           bmi: { type: Number, required: false },
           bodyFatPercentage: { type: Number, required: false },
           bloodPressure: {
               systolic: { type: Number, required: false },
               diastolic: { type: Number, required: false },
           },
           heartRate: { type: Number, required: false },
           respiratoryRate: { type: Number, required: false },
           bodyTemperature: { type: Number, required: false },
           spo2: { type: Number, required: false },
           bloodSugar: {
               fasting: { type: Number, required: false },
               postMeal: { type: Number, required: false },
               random: { type: Number, required: false },
           },
           cholesterol: {
               total: { type: Number, required: false },
               hdl: { type: Number, required: false },
               ldl: { type: Number, required: false },
               triglycerides: { type: Number, required: false },
           },
           hemoglobin: { type: Number, required: false },
           uricAcid: { type: Number, required: false },
           creatinine: { type: Number, required: false },
           oxygenLevel: { type: Number, required: false },
           temperatureUnit: { type: String, required: false },
           bloodGroup: { type: String, required: false },
           waistCircumference: { type: Number, required: false },
           hipCircumference: { type: Number, required: false },
           waistToHipRatio: { type: Number, required: false },
           hydrationLevel: { type: Number, required: false },
           sleepHours: { type: Number, required: false },
           stressLevel: { type: Number, required: false },
           activityLevel: { type: String, required: false },
           postureScore: { type: Number, required: false },
           visionScore: { type: Number, required: false },
           hearingScore: { type: Number, required: false },
        }
    }
)

export const UserInfo= mongoose.model("UserInfo",userInfoSchema);
