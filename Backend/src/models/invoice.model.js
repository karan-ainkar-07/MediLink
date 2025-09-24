import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        hospital:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Clinic",
        },
        patient:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        bill:
        {
            type:Number,
            required:true,
        },
        paidBy:
        {
            type:String,
            enum:["Cash","Online"],
            required:true,
        },
        balance:
        {
            type:Boolean,
            required:true,
        },
        balanceAmount:
        {
            type:Number,
            required:false,
        },
        appointments:
        [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"appointment",
            }
        ],
    },
    {
        timestamps:true,
    }
)

export const Invoice=mongoose.model("Invoice",invoiceSchema);