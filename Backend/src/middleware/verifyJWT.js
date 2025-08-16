import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandle.jsr";
import jwt from "jsonwebtoken"
const VerifyJWT=asyncHandler((req,_,next)=>{

    const token=req.cookies?.accessToken || req.header("Autorization")?.replace("Bearer ","");

    if(!token)
    {
        throw new ApiError(401,"UnAuthorized Request");
    }

    const decodedJWT=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

    const user=User.findById(decodedJWT?._id)
    .select("-password -refreshToken");

    if(!user)
    {
        throw new ApiError(401,"Invalid Access Token");
    }

    req.user=user;
    next();
})
export default VerifyJWT;