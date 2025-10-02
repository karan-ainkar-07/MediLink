import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const timingSchema = new Schema({
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
            default:"",
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
        },
        mobileNo:
        {
            type:Number,
            required:true,
            unique:true,
        },
        address:{
            line1:
            {
                type:String,
                required:true,
            },
            line2:
            {
                type:String,
                required:false,
            },
            city:
            {
                type:String,
                required:true
            },
            country:
            {
                type:String,
                required:true,
            },
            latLon:
            {
                type:String,
                required:false,
            }
        },
        status:
        {
            type:String,
            enum:["Open","Closed"],
            default:"Open",
        },
        timing:
        {
            type:[timingSchema],
            required:false,
        },
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

ClinicSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

ClinicSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

ClinicSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

ClinicSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const Clinic=mongoose.model("Clinic",ClinicSchema);