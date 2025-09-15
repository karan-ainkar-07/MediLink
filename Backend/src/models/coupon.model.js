import mongoose, { Schema } from "mongoose";

const CouponSchema=new Schema(
    {
        appointment:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Appointment",
        },
        expectedTime:
        {
            type:Number,
            required:false,
        },
        Status:
        {
            type:String,
            enum:["Used","Cancelled"]
        },
        issuedAt:
        {
            type:Date,
        },
        usedAt:
        {
            type:Date,
        }

    },
)

export const Coupon= mongoose.model("Coupon",CouponSchema);