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
        issuedAt:
        {
            type:Date,
            required:true,
        },
        usedAt:
        {
            type:Date,
        }
    },
    {
        timestamps:true,
    }
)

export const Coupon= mongoose.model("Coupon",CouponSchema);