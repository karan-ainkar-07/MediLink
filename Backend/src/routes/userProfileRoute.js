import {Router} from "express"
import verifyJWT from "../middleware/verifyJWT.js"
import {    
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
    getTopDoctors,
    viewAppointments,
    createUserInfo,
    updateUserInfo,
    getUserInfo,
    giveFeedback,
    pastAppointments} from "../controllers/userProfile.controller.js";

const router=Router();

router.route('/get-doctors').get(getDoctors);
router.route('/get-coupon-stats').get(getCouponStats);
router.route('/book-appointment').post(verifyJWT("User"),BookAppointment);
router.route('/get-doctor').get(getDoctor);
router.route('/get-top-doctors').get(getTopDoctors);
router.route('/view-appointments').get(verifyJWT("User"),viewAppointments);
router.route('/create-user-info').post(verifyJWT("User"), createUserInfo);
router.route('/update-user-info').patch(verifyJWT("User"), updateUserInfo);
router.route('/get-user-info').get(verifyJWT("User"), getUserInfo);
router.route('/give-feedback').post(verifyJWT("User"), giveFeedback);
router.route('/view-past-appointments').get(verifyJWT("User"),pastAppointments);
export default router;