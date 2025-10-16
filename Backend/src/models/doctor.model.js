import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const doctorSchema = new Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        mobileNo:{
            type:Number,
            required:true,
            unique:true,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"Password is required"],
        },
        refreshToken:{
            type:String,
        },
        isMobileVerified:{
            type:Boolean,
            default:false,
        },
        isEmailVerified:{
            type:Boolean,
            default:false,
        },
        education: [
          {
            degree: { type: String, required: true },    
            university: { type: String, required: true }, 
            year: { type: Number, required: true },       
            specialization: { type: String },  
          }
        ],
        experience:{
            type:Number,
            default:0,
        },
        specialization:{
            type:[String],
            enum:["Dentist","Dermatology", "Pediatrics","General Practitioner"],
            required:true,
            default:["General Practitioner"]
        },
        rate:{
            type:Number,
            default:500,
            required:false,
        },
        profileImage:{
            type:String,
            required:true,
        },
        clinic:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Clinic",
            required:true,
        },
        AppointmentTime: //average appointment time in seconds
        {
            type:Number,
            required:false,
        }
    },
    {
        timestamps:true,
    }
)

doctorSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

doctorSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

doctorSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            mobileNo: this.mobileNo,
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

doctorSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Doctor=mongoose.model("Doctor",doctorSchema);