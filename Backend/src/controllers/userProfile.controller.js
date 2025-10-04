import { UserInfo } from "../models/userInfo.model.js";
import mongoose from "mongoose";
import { Queue } from "../models/queue.model.js";
import {Doctor} from "../models/doctor.model.js"
import {Clinic} from "../models/Clinic.model.js"
import { Coupon } from "../models/coupon.model.js";
import {Appointment} from "../models/appointment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//Add, View, Edit Health Details

//See E-Prescriptions and Invoice (history of booking details)

//Book Doctor (coupon management)

    //get the list of doctors 
    const getDoctors = asyncHandler(async (req, res) => {
      const { specialization, city } = req.query;
    
      // find clinics in the city
      let clinicIds = [];
      if (city) {
        const clinics = await Clinic.find({ "address.city": city }).select("_id");
        clinicIds = clinics.map(c => c._id);
        if (clinicIds.length === 0) {
          return res.status(200).json(
            new ApiResponse(200, { data: [] }, "No doctors found in this city")
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
        "name address location"
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
      const { totalTokens, doctor, clinic } = queue;
    
      // create a new appointment
      const appointment = await Appointment.create({
        patient: userID,
        doctor: doctor,
        clinic: clinic,
        date: new Date(),
      });
    
      // increment the queue token count
      const couponNumber = totalTokens + 1;
    
      // create a new coupon linked to the appointment
      const coupon = await Coupon.create({
        appointment: appointment._id,
        couponNumber: couponNumber,
        Status: "Active",
        issuedAt: new Date(),
        partOfQueue: queue._id,
      });
    
      // update the queue totalTokens
      const queueDoc = await Queue.findById(queue._id);
      queueDoc.totalTokens += 1;
      await queueDoc.save();

    
      // return the coupon as response
      return res.status(200).json(
        new ApiResponse(200, coupon, "Appointment booked successfully")
      );
    });




export  {
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
}