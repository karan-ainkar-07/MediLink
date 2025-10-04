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
        partOfQueue:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Queue",
            required:true,
        }
    },
    {
        timestamps:true,
    }
)

CouponSchema.index(
    {createdAt:1},
    {expireAfterSeconds:0,partialFilterExpression:{Status: { $in:["Used","Cancelled"] } }}
)


export const Coupon= mongoose.model("Coupon",CouponSchema);