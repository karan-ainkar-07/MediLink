import { UserInfo } from "../models/userInfo.model.js";
import { Queue } from "../models/queue.model.js";
import {Doctor} from "../models/doctor.model.js"
import {Clinic} from "../models/Clinic.model.js"
import {Appointment} from "../models/appointment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//ready to deploy
//Add, View, Edit Health Details

    //Create new UserInfo document
    const createUserInfo= asyncHandler(async (req,res) =>{
      const userId=req.user?._id;
      const {form}=req.body;

      if(!userId)
      {
        throw new ApiError(401,"UnAutorized Access");
      }
      if(!form)
      {
        throw new ApiError(402,"Empty form");
      }

      form.user=userId;
      const userInfo= await UserInfo.create(form);

      if(!userInfo)
      {
        throw new ApiError(401,"Cant Create UserInfo document");
      }

      res.status(201)
        .json(
          new ApiResponse(201,userInfo,"UserInfo created SuccessFully")
        )
    })

    //const update UserInfo
    const updateUserInfo = asyncHandler(async (req,res) =>{
      const userId =req.user?._id;
      const {form} =req.body;

      if(!userId)
      {
        throw new ApiError(401,"UnAuthorized Access");
      }

      if(!form)
      {
        throw new ApiError(402,"Empty Form");
      }

      updatedInfo = await UserInfo.findOneAndUpdate({user:userId},{form});

      if(!updatedInfo)
      {
        throw new ApiError(404,"No User Info found");
      }

      res.status(201)
        .json(
          new ApiResponse(201,updatedInfo,"Info updated successfully")
        )
    })

    const getUserInfo =asyncHandler( async (req,res) =>{
        const userId =req.user._id;

        const Info= await UserInfo.findOne({user:userId});

        if(!Info)
        {
          throw new ApiError(404,"No UserInfo found , create one");
        }
        
        res.status(200)
          .json(
            new ApiResponse(200,Info,"Info fetched successfully")
          )
    })

//Book Doctor (coupon management)

    //get the list of doctors 
    const getDoctors = asyncHandler(async (req, res) => {
      const { specialization, city } = req.query;
    
      // find clinics in the city
      let clinicIds = [];
      if (city) {
        const clinics = await Clinic.find({ "address.city": city  }).select("_id");
        clinicIds = clinics.map(c => c._id);
        if (clinicIds.length === 0) {
          return res.status(200).json(
            new ApiResponse(200, { docList: [] }, "No doctors found in this city")
          );
        }
      }
    
       // build filters
      const filter = {};
      if (specialization) 
          filter.specialization = specialization;
        
      if (clinicIds.length > 0) 
          filter.clinic = { $in: clinicIds };
    
      // fetch doctors
      const doctors = await Doctor.find(filter).populate(
        "clinic",
        "name addresslocation"
      );
    
      return res.status(200).json(
        new ApiResponse(200, { docList: doctors }, "Doctors fetched successfully")
      );
    });

    //get Doctor using doctorId
    const getDoctor = asyncHandler( async (req,res)=>
    {
        const {doctorId}=req.query;
        if(!doctorId)
        {
          throw new ApiError(
            400,"Please enter valid doctorID"
          )
        }

        const doctor=await Doctor.findOne({_id:doctorId}).populate("clinic","address name ");
        if(!doctor)
        {
          throw new ApiError(
            404,"No doctor Found with this id"
          )
        }

        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              doctor,
              "Doctor fetched successfully"
            )
          )
    })


    //View the slots 
    const getCouponStats = asyncHandler(async (req,res) => {
      const { doctorId, clinicId } = req.query;
      
      if (!doctorId || !clinicId) {
        throw new ApiError(400, "DoctorId and ClinicId is required");
      }
      const start=new Date();
      start.setHours(0,0,0,0);

      const end=new Date(start);
      end.setDate(end.getDate()+1);

      const queue = await Queue.findOneAndUpdate(
        { clinic: clinicId, doctor: doctorId, date: { $gte: start, $lt: end }  },
        {      
          date: new Date(), 
          doctor: doctorId,          
          clinic: clinicId 
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      
      res.status(200).json(
        new ApiResponse(
          200,
          {
            currentCoupon:queue.currentToken,
            totalCoupons: queue.totalTokens,
            queueStatus:queue.status,
            queue:queue,
          },
          "CouponStats fetched successfully"
        )
      );
    });

    //Book the slot
    const BookAppointment = asyncHandler(async (req, res) => {
      // get the queue and userID from query
      const { queue } = req.body;

      const userID = req.user?._id;
    
      if (!queue || !userID) {
        throw new ApiError(404, "No userID or queue provided");
      }
    
      // get the total coupons from queue
      const { totalTokens, doctor, clinic, currentToken } = queue;
    
      // increment the queue token count
      const couponNumber = totalTokens + 1;

      //find clinic from the clinicId
      const doctorObj=await Doctor.findById(doctor)
      if(!doctorObj)
      {
        throw new ApiError(404,`No clinic with Id ${doctor} found`);
      }

      const averageTime=doctorObj.AppointmentTime;
      let expectedDate=null;
      if(averageTime)
      {
         const expectedTime=averageTime * (totalTokens-currentToken);
         expectedDate= new Date(Date.now() + expectedTime * 1000);
      }
      
      const date=new Date();

      // create a new appointment
      const appointment = await Appointment.create({
        patient: userID,
        doctor: doctor,
        clinic: clinic,
        couponNumber: couponNumber,
        date: date,
        partOfQueue: queue._id,
        expectedTime: expectedDate,
      });
        
      // update the queue totalTokens
      const queueDoc = await Queue.findById(queue._id);
      queueDoc.totalTokens += 1;
      await queueDoc.save();

    
      // return the coupon as response
      return res.status(200).json(
        new ApiResponse(200, appointment, "Appointment booked successfully")
      );
    });

    //const toggel is Present in the clinic 
    const isPresent = asyncHandler(async (req, res) => {
      const userId = req.user._id;
      const { appointmentId } = req.query;
    
      if (!appointmentId) {
        throw new ApiError(402, "No appointmentId provided");
      }
    
      const appointment = await Appointment.findOne({ _id: appointmentId,   patient:  userId });
      if (!appointment) {
        throw new ApiError(404, "Appointment not found");
      }
    
      appointment.isPresent = !appointment.isPresent;
      await appointment.save();
    
      res.status(200)
          .json(
            new ApiResponse(200,appointment,"Appointment is present updated successfully")
      );
    });

    //View Appointments
    const viewAppointments =asyncHandler( async(req,res) =>{

      const userId=req.user._id;
      if(!userId)
      {
        throw new ApiError(401,"Unable to get the UserId");
      }

      //make a list of objects for each appointment containing every info
      const appointments = await Appointment.find({patient:userId, status:"Booked"})
      .populate(
        "partOfQueue",
        ["status","currentToken"]
      )
      .populate(
        "clinic",
        ["name","logo","mobileNo","address","email"]
      )
      .populate(
        "doctor",
        ["name","profileImage","specialization","rate"]
      )
      ;

      if(!appointments)
      {
        throw new ApiError(403,"Unable to find Appoitments");
      }



      return res
              .status(200)
              .json(
                new ApiResponse(200,{appointments},"Appointments fetched successfully")
              )
    });

    //past appointments 
    const pastAppointments =asyncHandler( async(req,res) =>{

      const userId=req.user._id;
      if(!userId)
      {
        throw new ApiError(401,"Unable to get the UserId");
      }

      //make a list of objects for each appointment containing every info
      const appointments = await Appointment.find({patient:userId,status:{
        $in:["Completed","Cancelled"],
      }})
      .populate(
        "clinic",
        ["name","logo","mobileNo","address","email"]
      )
      .populate(
        "doctor",
        ["name","profileImage","specialization","rate"]
      );

      if(!appointments)
      {
        throw new ApiError(403,"Unable to find Appoitments");
      }



      return res
              .status(200)
              .json(
                new ApiResponse(200,{appointments},"Appointments fetched successfully")
              )
    });

export  {
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
    viewAppointments,
    isPresent,
    createUserInfo,
    updateUserInfo,
    getUserInfo,
    pastAppointments,
}