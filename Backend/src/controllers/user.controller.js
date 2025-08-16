import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser=asyncHandler( async(req,res)=>{

    //get user details from req
    const {email,mobileNo,password}=req.body;

    //validate details check if empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user exists 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //if not create a new user object 
    const user=User.create(
        {
            email,
            mobileNumber,
            password,
        }
    )

    //remove password and refresh token from the res
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check if user is created 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return the res 
    return res.status(201).json(
        new ApiResponse(201,createdUser,"User Created succesfully")
    )
})




export {registerUser};