import { UserInfo } from "../models/userInfo.model.js";
import { Queue } from "../models/queue.model.js";
import {Doctor} from "../models/doctor.model.js"
import {Appointment} from "../models/appointment.model.js"
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Feedback } from "../models/feedback.model.js";

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
       // build filters
      const filter = {};
      if (specialization) 
          filter.specialization = specialization;
        
      if (city)
      {
        filter["address.city"] =  city;
      }
    
      // fetch doctors
      const doctors = await Doctor.find(filter)
    
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

        const doctor=await Doctor.findOne({_id:doctorId});

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

      const { doctorId, dateStr } = req.query;

      if (!doctorId) {
        throw new ApiError(400, "DoctorId is required");
      }

      const fetchedDoctor = await Doctor.findById(doctorId);

      const selectedDate = new Date(dateStr);

      if (isNaN(selectedDate.getTime())) {
        throw new ApiError(403,"Cant change to standard date");
      }

      const queue = await Queue.findOne({
        doctor: doctorId,
        date: selectedDate
      });

      function minutesToDisplay(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
      }

      const now = new Date();

      const isToday =
        now.getFullYear() === selectedDate.getFullYear() &&
        now.getMonth() === selectedDate.getMonth() &&
        now.getDate() === selectedDate.getDate();

      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const bookedSet = new Set();

      if (queue) {
        const todayAppointments = await Appointment.find({ partOfQueue: queue._id });

        todayAppointments.forEach(appt => {
          bookedSet.add(appt.time);
        });
      }

      const Coupons = [];

      for (let i = fetchedDoctor.startTime; i < fetchedDoctor.endTime; i += fetchedDoctor.slotTime) {

        let isCouponAvailable = true;

        if (isToday && i <= nowMinutes) {
          isCouponAvailable = false;
        }

        if (bookedSet.has(i)) {
          isCouponAvailable = false;
        }

        Coupons.push({
          startTime: i,
          couponNumber: Math.floor((i - fetchedDoctor.startTime) / fetchedDoctor.slotTime) + 1,
          available: isCouponAvailable,
          displayTime: minutesToDisplay(i),
        });
      }
      const isQueue= queue ? true : false

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            availableCoupons: Coupons,
            status: queue ? queue.status : "In-Progress",
            doctor: queue ? queue.doctor : doctorId,
            date: queue ? queue.date : selectedDate,
            isQueue:isQueue,
          },
          "CouponStats fetched successfully"
        )
      );
    });

    //Book the slot
    const BookAppointment = asyncHandler(async (req, res) => {
      // get the queue and userID from query
      const { doctorId,date,time,couponNumber} = req.body;

      const userID = req.user?._id;
    
      if (!doctorId || !date || !time || !couponNumber) {
        throw new ApiError(404, "No doctorId or date or time provided");
      }
      const fetchedDoctor=await Doctor.findById(doctorId);

      if(!fetchedDoctor)
      {
        throw new ApiError(404,"No doctor found");
      }
    
      const formattedDate=new Date(date);
      let queue= await Queue.findOne({doctor:doctorId,date:formattedDate});

      if(!queue)
      {
        await Queue.create({
          doctor:doctorId,
          date:formattedDate,
        })

        queue=await Queue.findOne({doctor:doctorId,date:formattedDate});
      }

      await queue.save();

      // create a new appointment
      const appointment = await Appointment.create({
        patient: userID,
        doctor: doctorId,
        couponNumber:couponNumber,
        date: date,
        time:time,
        partOfQueue: queue._id,
      });
            
      // return the coupon as response
      return res.status(200).json(
        new ApiResponse(200, appointment, "Appointment booked successfully")
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
        "doctor",
        ["name","profileImage","specialization","rate","address","clinicName"]
      )
      ;

      if(!appointments)
      {
        throw new ApiError(403,"Unable to find Appointments");
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
      const appointments = await Appointment.find({patient:userId,status:"Completed"})
      .populate(
        "doctor",
        ["name","profileImage","specialization","rate","address","clinicName"]
      );

      if(!appointments)
      {
        throw new ApiError(403,"Unable to find Appoitments");
      }

      return res
              .status(200)
              .json(
                new ApiResponse(200,appointments,"Appointments fetched successfully")
              )
    });

    const getTopDoctors = asyncHandler(async (req, res) => {
      const doctors = await Doctor.find({ totalFeedback: { $gt: 3 } }).sort({ rating: -1 });    
      res.status(200).json(new ApiResponse(true, doctors, "Top doctors fetched successfully"));
    });

    const giveFeedback = asyncHandler( async (req,res)=>{
      const userId= req.user?._id;
      const {appointmentId,doctorId}= req.query;
      const {overall,waiting,staff,explanation,comments,cleanliness,attentive}=req.body;

      if(!userId || !appointmentId || !doctorId)
      {
        console.log(appointmentId)
        throw new ApiError(402,"No userId or AppointmentId or doctorId used");
      }

      if(!overall)
      {
        throw new ApiError(402,"No Rating given");
      }

      const doctor=await Doctor.findOne({_id:doctorId})
      if(doctor.totalFeedback!=0)
      {
doctor.rating = ((doctor.rating * doctor.totalFeedback) + overall) / (doctor.totalFeedback + 1);

      }
      else
      {
        doctor.rating=overall;
      }
      await doctor.save()

      await Doctor.findOneAndUpdate({_id:doctorId},{$inc:{totalFeedback:1}},{new:true});
      const appointment =await Appointment.findOneAndUpdate({_id:appointmentId},{feedbackGiven:true});
      await Feedback.create(
        {
          doctor:doctorId,
          appointment:appointmentId,
          patient:userId,
          rating:overall,
          feedback:comments,
          attentiveness:attentive,
          explanationOfCondition:explanation,
          cleanliness:cleanliness,
          staffBehaviour:staff,
          waitingTime:waiting,
        }
      )
      res.status(200).json(
        new ApiResponse(200,doctorId)
      );
    })

export  {
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
    viewAppointments,
    createUserInfo,
    getTopDoctors,
    giveFeedback,
    updateUserInfo,
    getUserInfo,
    pastAppointments,
}