import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const doctorSchema = new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
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
            type:String,
            enum:["Dentist","Dermatology", "Pediatrics","General Practitioner"],
            required:true,
            default:"General Practitioner"
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
        startTime:{
            type:Number,
            required:false,
            default:540, // midnight + 60(minutes) * hour start
        },
        endTime:{
            type:Number,
            required:false,
            default:1080,
        },
        slotTime:{
            type:Number,
            required:false,
            default:20,
        },
        rating:{
            type:Number,
            required:false,
        },
        totalFeedback:{
            type:Number,
            required:false,
            default:0,
        },
        clinicName:{
            type:String,
            required:true,
        },
        address:{
            line1:{
                type:String,
                required:true,
            },
            line2:{
                type:String,
                required:false,
            },
            city:{
                type:String,
                required:true,
            },
            state:{
                type:String,
                required:true,
            }
        },
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