import bcrypt from "bcrypt"
import {Otp} from '../models/otp.model'

function generateOTP(length ) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); 
  }
  return otp;
}

async function createOTP(userId,length=6)
{
  const otp=generateOTP(length);

  const hashedCode=await bcrypt.hash(otp,10);

  await Otp.create(
    {
      userId,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    }
  )
}
export  {generateOTP,};
