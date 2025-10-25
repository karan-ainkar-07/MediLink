import jwt, { decode } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Clinic } from "../models/Clinic.model.js";

const VerifyJWT = (role) =>
  asyncHandler(async (req, _, next) => {
    //  Get token from cookie or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request: No token provided");
    }

    //  Verify token
    let decodedJWT;
    try {
      decodedJWT = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (err) {
      throw new ApiError(401, "Invalid Access Token");
    }

    //  Select the model based on role
    let Model;
    switch (role) {
      case "User":
        Model = User;
        break;
      case "Doctor":
        Model = Doctor;
        break;
      case "Clinic":
        Model = Clinic;
        break;
      default:
        throw new ApiError(500, "Role not recognized in VerifyJWT");
    }

    // 4. Fetch user from DB
    const user = await Model.findById(decodedJWT._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.log(decodedJWT)
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    // 5. Attach user to request
    req.user = {
      ...user.toObject(),
      _id: user._id.toString(),   
    };

    next();
  });

export default VerifyJWT;
