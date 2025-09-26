import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser=asyncHandler( async(req,res)=>{

    //get user details from req
    const {email,mobileNo,password}=req.body;

    //validate details check if empty
    if (
        [ email, mobileNo, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user exists 
    const existedUser = await User.findOne({
        $or: [{ mobileNo }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //if not create a new user object 
    const user=await User.create(
        {
            email,
            mobileNo,
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

const loginUser=asyncHandler(async(req,res)=>{

    //get data from frontend
    const {email,mobileNo,password}=req.body;

    //validate if empty
    if(!email && !mobileNo)
    {
        throw new ApiError(400,"email or mobile number is required");
    }

    //check if User exist
    const user=await User.findOne({
        $or: [{mobileNo},{email}]
    })

    if(!user)
    {
        throw new ApiError(400,"User don't exist");
    }

    //check if password is correct
    if(!(await user.isPasswordCorrect(password)))
    {
        throw new ApiError(401,"Incorrect Password")
    }

    //Generate access and refresh token (store refresh token in DB)
    const {refreshToken,accessToken}=await generateAccessAndRefreshTokens(user);
    user.password=undefined;

    const options={
        httpOnly: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,                             
            {
                User: user, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logOut=asyncHandler(async(req,res)=>{

    //get the current user and check if he is logged in 
    await User.findByIdAndUpdate(req.user._id,
    {
        $set:
        {
            refreshToken:undefined,
        }
    },
    {
        new:true,
    }
)

    const options={
        httpOnly: true,
        secure: true,
    }

    //remove the cookie that contain access token
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    //get current refreshToken from cookie
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    //check if the refreshToken is same in DB and incomming
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    //generate new token and store to cookie
    const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )
})

const resetPassword = asyncHandler(async (req, res) => {
    // get the entered old and new password 
    const { oldPassword, newPassword } = req.body;  
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // fetch the user and verify the entered password
    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(401, "Incorrect Password");
    }

    // check if old and new password don't match 
    if (oldPassword === newPassword) {
        throw new ApiError(402, "Password is same as old password");
    }

    // set the new password
    user.password = newPassword;
    await user.save();   // pre-save hook will hash it

    return res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});


export {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    resetPassword,
};

