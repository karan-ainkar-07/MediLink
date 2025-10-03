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
    
      const coupons = await Coupon.find({ Status: { $in: ["Used", "Cancelled", "Booked"] } })
        .populate({
          path: "appointment",
          match: { doctor: doctorId, clinic: clinicId }
        });
      
      const filteredCoupons = coupons.filter(c => c.appointment != null);
      
      const activeCoupons = filteredCoupons.filter(c => c.Status === "Booked");
      
      const sortedActiveCoupons = activeCoupons.sort((a, b) => a.issuedAt - b.issuedAt);
      
      const currentCoupon = sortedActiveCoupons.length > 0 ? sortedActiveCoupons[0] : null;
      
      res.status(200).json(
        new ApiResponse(
          200,
          {
            totalActive: activeCoupons.length,
            currentCoupon,
            totalCoupons: filteredCoupons.length
          },
          "CouponStats fetched successfully"
        )
      );
    });


    //Book the slot

    const generateNextCouponNumber = async (doctorId, clinicId) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
    
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    
      // Find the latest coupon for this doctor+clinic for today
      const appointmentsToday = await Appointment.find({
        doctor: mongoose.Types.ObjectId(doctorId),
        clinic: mongoose.Types.ObjectId(clinicId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }).select("_id");

      const appointmentIds = appointmentsToday.map(a => a._id);
      
      const lastCoupon = await Coupon.findOne({
        appointment: { $in: appointmentIds },
      }).sort({ issuedAt: -1 });
    
      return lastCoupon ? lastCoupon.couponNumber + 1 : 1; 
    };

    const BookAppointment = asyncHandler(async (req, res) => {
      const { doctorId, clinicId } = req.query;
      const user = req.user;
    
      if (!doctorId || !clinicId) {
        throw new ApiError(400, "DoctorId and ClinicId are required");
      }
  
      if (!user) {
        throw new ApiError(401, "Unauthorized Access");
      }
  
      //Create the appointment
      const appointment = await Appointment.create({
        patient: user._id,
        doctor: doctorId,
        clinic: clinicId,
        date: new Date(),
        status: "Booked"
      });
  
  
      const nextNumber=await generateNextCouponNumber(doctorId,clinicId);

      //create a new queue if it is the first coupon
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); 

        let queue = await Queue.findOne({
          Doctor: doctorId,
          Clinic: clinicId,
          date: { $gte: startOfDay, $lte: endOfDay }
        });


      if(!queue)
      {
        queue=await Queue.create(
          {
            Doctor:doctorId,
            Clinic:clinicId,
            Status:"Stopped",
            date:new Date()
          }
        )
      }


      //Create the coupon
      const coupon = await Coupon.create({
        appointment: appointment._id,
        issuedAt: new Date(),
        Status: "Active",
        couponNumber: nextNumber,
        partOfQueue:queue._id,
      });

  
      res
        .status(201)
        .json(
            new ApiResponse(201,
                {
                    success: true,
                    appointment,
                    coupon
                },"Appointment booked successfully"
            )
        );
    });



export  {
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
}