import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Doctor } from "../models/doctor.model.js";
import { Appointment } from "../models/appointment.model.js";
import {Queue} from "../models/queue.model.js"
import {Prescription} from "../models/prescription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/Email.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Clinic } from "../models/Clinic.model.js";

const generateAccessAndRefreshTokens = async(user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser=asyncHandler( async(req,res)=>{

    //get user details from req
    const {name,email,mobileNo,password,experience,educationString,specialization,clinic}=req.body;

    //get loalFile from multer req.files
    const localFilePath=req.file;
    //validate details check if empty
    if (
        [name, email,mobileNo,password,clinic].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    let education=[];
    if (typeof educationString === "string") {
        education = JSON.parse(educationString);
    }

    if (!education || education.length === 0) {
        throw new ApiError(400, "Education cannot be empty");
    }
  
    //check if user exists 
    const existedUser = await Doctor.findOne({
        $or: [{ mobileNo }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //Upload localFile on cloudinary using multer and get the Address of stored Image
    let profileImage = ""; 

    if (localFilePath) {
        const uploaded = await uploadOnCloudinary(localFilePath.path);
        profileImage = uploaded?.url || ""; 
    }
    
    //if not create a new user object 
    const user=await Doctor.create(
        {
            name,
            email,
            mobileNo,
            password,
            experience,
            education,
            clinic,
            specialization,
            profileImage,
        }
    )

    //remove password and refresh token from the res
    const createdUser = await Doctor.findById(user._id).select(
        "-password"
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
    const user=await Doctor.findOne({
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
    await Doctor.findByIdAndUpdate(req.user._id,
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
        process.env.REFRESH_TOKEN_KEY
    )

    const user = await Doctor.findById(decodedToken?._id)

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
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

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
    const user = await Doctor.findById(req.user._id);

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

    return res
        .status(200)
        .json(new ApiResponse(200,"Password changes successfully"));
});

const startClinic =asyncHandler(async (req,res) =>{
    //get the Clinic from the query
    const {clinic} =req.query

    //check if the Clinic is not empty
    if(!clinic)
    {
        throw new ApiError(404,"No Clinic input");
    }

    //change the status to Open if closed 
    const closeClinic= await Clinic.findOneAndUpdate({_id:clinic},{$set:{ status: "Open"}});

    if(!closeClinic)
    {
        throw new ApiError("Unable to Update the status ");
    }

    closeClinic.password=undefined;

    res.status(200)
        .json(
            new ApiResponse(200,closeClinic,"Status Changed SuccessFully")
        );

})

const closeClinic =asyncHandler(async (req,res) =>
{
    //get the Clinic from the query
    const {clinic} =req.query

    //check if the Clinic is not empty
    if(!clinic)
    {
        throw new ApiError(404,"No Clinic input");
    }

    //change the status to Open if closed 
    const closeClinic= await Clinic.findOneAndUpdate({_id:clinic._id},{$set:{ status: "Closed"}});

    if(!closeClinic)
    {
        throw new ApiError("Unable to Update the status ");
    }

    //return response
    closeClinic.password=undefined;

    res.status(200)
        .json(
            new ApiResponse(200,closeClinic,"Status Changed SuccessFully")
        );
})

const pauseQueue = asyncHandler(async (req, res) => {
    const DoctorId  = req.user._id;

    const QueueDoc = await Queue.findOneAndUpdate(
        { doctor:DoctorId },
        { $set: { status: "Stopped" } },
        { new: true }
    );

    if (!QueueDoc) {
        throw new ApiError(400, "Queue doesn't exist");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            QueueDoc,
            "Queue paused successfully",
        )

    );
});

const resumeQueue = asyncHandler(async (req, res) => {
    const DoctorId  = req.user._id;

    const QueueDoc = await Queue.findOneAndUpdate(
        { doctor:DoctorId },
        { $set: { status: "In-Progress" } },
        { new: true }
    );

    if (!QueueDoc) {
        throw new ApiError(400, "Queue doesn't exist");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            QueueDoc,
            "Queue Resumed successfully",
        )

    );
});

const viewAppointments= asyncHandler(async (req,res)=>{
    //const get the doctorId, from the cookies
    const doctorId=req.user._id;

    if(!doctorId)
    {
        throw new ApiError(402,"UnAutorized access");
    }

    //get the queue of the day for the doctor 
    const queue = await Queue.findOne({doctor:doctorId});
    if(!queue)
    {
        res.status(200)
            .json(
                new ApiResponse(200,{},"No Appointments Today")
            );
    }

    //get the appointments only the booked and which are not completed yet using the queue id 
    const appointments = await Appointment.find({
        partOfQueue: queue._id,
        status: "Booked"
    })
    .sort({ createdAt: 1 })
    .populate({
        path: "patient", 
        select: "name email mobileNo" 
    })
    
    //return the appointments array 
    res.status(200)
        .json(
            new ApiResponse(200,appointments,"Appointments fetched Successfully")
        );
})

const nextCoupon = asyncHandler(async (req, res) => {
    //  Get the latest coupon
    const DoctorId= req.user._id;

    const queue= await Queue.findOneAndUpdate({doctor:DoctorId},{$inc:{currentToken:1}},{new:true})

    const nextPatient = await Appointment.findOneAndUpdate(
        { doctor: DoctorId, partOfQueue: queue._id, isPresent: true, status: "Booked" },
        { $set: { status: "In-Progress", startTime: new Date() } },
        { new: true, sort: { createdAt: 1 } } // sort & return updated document
    )
    .populate("patient", "name email"); // populate after update

    if(!nextPatient)
    {
        throw new ApiError(404,"No active Appointment found");
    }

    const absentAppointments = await Appointment.find({doctor:DoctorId,partOfQueue:queue._id, isPresent:false , status:"Booked"});

    await Appointment.updateMany({doctor:DoctorId,partOfQueue:queue._id, isPresent:false , status:"Booked"},{status:"Cancelled"});

    //to be done
    // absentAppointments.forEach(()=>{
    //     sendEmail();
    // })

    //set the appointment starting time
    nextPatient.startTime=new Date();

    // to be done
    // sendNotification(nextPatient);

    //  Send response
    res.status(200).json(
        new ApiResponse(200,
            {
                queue,
                nextPatient,
            },
            "queue moved infront"
        )
    );
});

const saveAndSendPrescription = asyncHandler(async(req,res)=>{
    //get the patient and user from the req.query
    const doctorId =req.user._id;

    const {patientId,QueueId} = req.query;

    //get the Prescription form the body
    const {diagnoses,medicines,notes}=req.body;
    
    const appointment=await Appointment.findOne({patient:patientId,doctor:doctorId ,partOfQueue:QueueId, status:"Booked"});

    if(!appointment)
    {
        throw new ApiError(402,"cant find Appointment")
    }

    const queue = Queue.findOne({_id:appointment.partOfQueue});
    
    const nowTime= new Date();
    const timeTakenSec=(nowTime-appointment.startTime)/1000;
    queue.timeTaken.push(timeTakenSec);
    await queue.save();

    //change the status to completed
    appointment.status="Completed";
    await appointment.save();

    if(!diagnoses || !diagnoses[0] || !medicines || !medicines[0])
    {

        new ApiResponse(200,appointment,"Appointment Completed successfully");
    }
    const duration = medicines.map((medicine) => medicine.duration); 
    const maxDuration = Math.max(...duration); 
    const endDate = new Date(Date.now() + maxDuration * 24 * 60 * 60 * 1000);

    //save the prescription
    const prescription=await Prescription.create(
        {
            appointment:appointment._id,
            notes:(notes? notes: ""),
            diagnoses,
            medicines,
            endDate,
            startDate :new Date(Date.now()),
        }
    )

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                prescription,
                "Prescription created successfully"
            )
        )
}) 

const saveAndSendInvoice = asyncHandler( async (req,res)=>{

})

export {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    resetPassword,
    resumeQueue,
    startClinic,
    closeClinic,
    pauseQueue,
    viewAppointments,
    nextCoupon,
    saveAndSendPrescription,
}