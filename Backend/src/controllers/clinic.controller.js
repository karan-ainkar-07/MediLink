import asyncHandler from "../utils/AsyncHandler.js";
import { Clinic } from "../models/Clinic.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateAccessToken } from "../utils/jwt.js"; 

const loginClinic = asyncHandler(async (req, res) => {
    // Get data from frontend
    const { name, password } = req.body;

    // Validate if empty
    if (!name) {
        throw new ApiError(400, "Email or mobile number is required");
    }

    // Check if Clinic exists
    const clinic = await Clinic.findOne(name);

    if (!clinic) {
        throw new ApiError(400, "Clinic does not exist");
    }

    // Check if password is correct
    if (!(await clinic.isPasswordCorrect(password))) {
        throw new ApiError(401, "Incorrect Password");
    }

    // Generate access token
    const accessToken = generateAccessToken(clinic._id); 
    clinic.password = undefined; 

    const options = {
        httpOnly: true,
        secure: true, 
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
    const { name, password, addressLine1, addressLine2, city, country } = req.body;

    // Validate required fields
    if ([name, password, addressLine1, city, country].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Upload logo to Cloudinary if provided
    const localLogo = req.file; // multer should handle this
    const logo = localLogo ? await uploadOnCloudinary(localLogo.path) : "";

    // Create new clinic
    const clinic = await Clinic.create({
        name,
        password,
        logo,
        Address: {
            Line1: addressLine1,
            Line2: addressLine2 || "",
            City: city,
            Country: country
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

export {
    loginClinic,
    registerClinic,
    logoutClinic,
}
