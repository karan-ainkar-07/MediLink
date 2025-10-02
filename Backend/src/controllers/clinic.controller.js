import {asyncHandler} from "../utils/AsyncHandler.js";
import { Clinic } from "../models/Clinic.model.js";
import {ApiError} from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async(user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const loginClinic = asyncHandler(async (req, res) => {
    // Get data from frontend
    const { email, password } = req.body;

    // Validate if empty
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    if(!password)
    {
        throw new ApiError(400,"Password is required");
    }

    // Check if Clinic exists
    const clinic = await Clinic.findOne({email});

    if (!clinic) {
        throw new ApiError(400, "Clinic does not exist");
    }

    // Check if password is correct
    if (!(await clinic.isPasswordCorrect(password))) {
        throw new ApiError(401, "Incorrect Password");
    }

    // Generate access token
    const {accessToken} = await generateAccessAndRefreshTokens(clinic); 
    clinic.password = undefined; 

    const options = {
        httpOnly: process.env.ENVIRONMENT=== "production",
        secure: process.env.ENVIRONMENT=== "production", 
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    Clinic: clinic,
                    accessToken
                },
                "Clinic logged in successfully"
            )
        );
});

const registerClinic = asyncHandler(async (req, res) => {
    // Get clinic details from request
    const { name, password, addressLine1, addressLine2, city, country, mobileNo, email } = req.body;

    // Validate required fields
        if ([name, password, addressLine1, city, country, mobileNo, email].some(field => {
            if (typeof field === "string") return field.trim() === "";
            return field == null; 
        })) 
        {
            throw new ApiError(400, "All required fields must be provided");
        }


    // Upload logo to Cloudinary if provided
    const localLogo = req.file;
    console.log(localLogo);
    const logo = localLogo ? await uploadOnCloudinary(localLogo.path) : "";

    // Create new clinic
    const clinic = await Clinic.create({
        name,
        password,
        logo:logo.url,
        mobileNo,
        email,
        address: {
            line1: addressLine1,
            line2: addressLine2 || "",
            city: city,
            country: country
        },
        Status: "Open"
    });

    // Remove password from response
    const createdClinic = await Clinic.findById(clinic._id).select("-password");

    if (!createdClinic) {
        throw new ApiError(500, "Something went wrong while registering the clinic");
    }

    return res.status(201).json(
        new ApiResponse(201, createdClinic, "Clinic registered successfully")
    );
});

const logoutClinic = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true, 
    };

    //Clear the Access token from the Cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "Clinic Logged Out"));
});

const getClinic =asyncHandler(async ( req, res)=>{
    const {name,city}=req.query;

    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" }; 
    if (city) filter["address.city"] = { $regex: city, $options: "i" };

    const clinics = await Clinic.find(filter).select("-password -refreshToken");

    if(!clinics || clinics.length===0)
    {
        throw new ApiError(404,"No Clinic found");
    }
    console.log(clinics);
    return res
            .status(200)
            .json(
                new ApiResponse(200,clinics,"Clinics Fetched Successfully")
            )

})

export {
    loginClinic,
    registerClinic,
    logoutClinic,
    getClinic,
}
