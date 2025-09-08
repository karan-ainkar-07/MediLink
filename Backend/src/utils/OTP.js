import bcrypt from "bcrypt"
import {Otp} from '../models/otp.model'
import VerifyJWT from "../middleware/verifyJWT";
import { ApiError } from "./ApiError";

function generateOTP(length ) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); 
  }
  return otp;
}

async function createOTP(userId,length=6,type)
{

  await Otp.deleteMany({
    $and: [{ userId: userId }, { type: type }]
  });

  const code=generateOTP(length);

  const hashedCode=await bcrypt.hash(code,10);

  await Otp.create(
    {
      userId,
      otp: hashedCode,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  )

  return code;
}

async function VerifyOTP(userId,inputOTP){
  const storedOtpObject= await Otp.findByID({userId});
  
  if(!storedOtpObject)
  {
    throw new ApiError(401,"OTP is expired or not found");
  }

  const isValid = await bcrypt.compare(inputOTP, storedOtpObject.otp);

  if (!isValid)
  {
    throw new ApiError(401,"OTP is invalid")
  }

  await Otp.deleteOne({ _id: record._id });

  return true;
}

export  {generateOTP, createOTP, VerifyOTP};
