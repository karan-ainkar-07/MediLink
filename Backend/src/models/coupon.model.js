import mongoose, { Schema } from "mongoose";

const CouponSchema=new Schema(
    {
        appointment:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Appointment",
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
        Status:
        {
            type:String,
            enum:["Used","Cancelled","Active"]
        },
        timeTaken:
        {
            type:Number,
            required:false,
        },
        issuedAt:
        {
            type:Date,
            required:true,
        },
        usedAt:
        {
            type:Date,
        },
        partOfQueue:
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        }
    },
    {
        timestamps:true,
    }
)

export const Coupon= mongoose.model("Coupon",CouponSchema);