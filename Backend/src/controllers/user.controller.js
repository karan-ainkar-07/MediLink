import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Otp } from "../models/otp.model.js";
import jwt from "jsonwebtoken"
import { createOTP, VerifyOTP } from "../utils/OTP.js";
import {sendEmail} from "../utils/Email.js"

const generateAccessAndRefreshTokens = async(user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser=asyncHandler( async(req,res)=>{

    //get user details from req
    const {email,password,name}=req.body;

    //validate details check if empty
    if (
        [ email, password, name].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user exists 
    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "This email is already registered")
    }

    //if not create a new user object 
    const user=await User.create(
        {
            name,
            email,
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

    //send Mail
    const OTP= await createOTP(email,6,"email");
    const subject="Your OTP for the Email verification"
    const text=`${OTP} is your 6 digit One Time Password for the Email Verification`;

    await sendEmail({
      to: email,
      subject: subject,
      text: text
    });

    //return the res 
    return res.status(201).json(
        new ApiResponse(201,{requiresVerification: true},"User Created succesfully ,OTP send to the Email, now verify the user ")
    )
})

const verifyEmail=asyncHandler( async(req,res) =>{
    const {email,OTP} =req.body;

    if(!email || !OTP)
    {
        throw new ApiError(401,"Please enter email and OTP");
    }

    const user=await User.findOne({email});

    if(!user)
    {
        throw new ApiError(404,"Please register again , User Not Found");
    }

    const OTPdoc= await Otp.findOne({email,type:"email"})
    
    if(!OTPdoc)
    {
        throw new ApiError(404,"OTP not found or expired")
    }

    if(!(await VerifyOTP(email,OTP)))
    {
        throw new ApiError(402,"Incorrect OTP ");
    }

    user.isEmailVerified=true;
    
    await user.save();

    //login the user 
    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user);
    user.password = undefined;

    const options = {
        httpOnly: process.env.ENVIRONMENT==="production",
        secure: process.env.ENVIRONMENT==="production", 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                "Email verified Successfully"
            )
        );

})

const loginUser = asyncHandler(async (req, res) => {
    // get data from frontend
    const { email, password } = req.body;

    // validate inputs
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // check if User exists
    const user = await User.findOne({ email:email.trim() });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    if(!user.isEmailVerified)
    {
        //send Mail
        const OTP=await createOTP(email,6,"email");
        const subject="Your OTP for the Email verification"
        const text=`${OTP} is your 6 digit One Time Password for the Email Verification`;
        await sendEmail({
          to: email,
          subject: subject,
          text: text
        });

        //route user to verify email ( through frontend)
         return res.status(200).json(
            new ApiResponse(200, { requiresVerification: true }, "OTP sent to email")
         );

    }
    // generate access and refresh tokens
    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user);
    user.password = undefined;

    const options = {
        httpOnly: process.env.ENVIRONMENT=== "production",
        secure: process.env.ENVIRONMENT=== "production", 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken,requiresVerification:false },
                "User logged in successfully"
            )
        );
});


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
    verifyEmail,
};

