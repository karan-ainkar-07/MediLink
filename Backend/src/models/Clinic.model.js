import mongoose from "mongoose";

const timingSchema = new mongoose.Schema({
  week: {
    type: String,
    enum: ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"],
    required: true
  },
  start: {
    type: String, 
    required: true
  },
  end: {
    type: String, 
    required: true
  }
});

const ClinicSchema=new Schema(
    {
        name:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
        logo:{
            type:String,
            required:false,
        },
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
        Status:
        {
            type:String,
            enum:["Open","Closed"],
        },
        Timing:[timingSchema],

        ratings: {
            type: Number,
            default: 0
        },
        reviews: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            rating: Number,
            date: { type: Date, default: Date.now }
        }],
        images: {
            type: [String],
            required: false
        }
    }
)

export const Clinic=mongoose.model("Clinic",ClinicSchema);
ClinicSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            name:this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}