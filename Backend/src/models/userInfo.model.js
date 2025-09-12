import mongoose, { Schema } from "mongoose";

const userInfoSchema= new Schema(
    {
        Address:{
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
        
        ProfileImage:{
            type:String,
            required:false,
        },

        Vitals:{
            height:
            {
                type:Number,
                required:false,
            },
            weight:
            {
                type:Number,
                required:false,
            },
            age:
            {
                type:Number,
                required:false,
            },
        }

    }
)