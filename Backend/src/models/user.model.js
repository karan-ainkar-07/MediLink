import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        mobileNumber:{
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
    },
    {
        timestamps:true,
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

export const User=mongoose.model("User",userSchema);