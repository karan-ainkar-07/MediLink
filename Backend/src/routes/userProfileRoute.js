import {Router} from "express"
import verifyJWT from "../middleware/verifyJWT.js"
import {    
    getDoctors,
    getCouponStats,
    BookAppointment,
    getDoctor,
    viewAppointments,
    isPresent,
    createUserInfo,
    updateUserInfo,
    getUserInfo} from "../controllers/userProfile.controller.js";

const router=Router();

router.route('/get-doctors').get(getDoctors);
router.route('/get-coupon-stats').get(getCouponStats);
router.route('/book-appointment').post(verifyJWT("User"),BookAppointment);
router.route('/get-doctor').get(getDoctor);
router.route('/view-appointments').get(verifyJWT("User"),viewAppointments);
router.route('/is-present').patch(verifyJWT("User"), isPresent);
router.route('/create-user-info').post(verifyJWT("User"), createUserInfo);
router.route('/update-user-info').patch(verifyJWT("User"), updateUserInfo);
router.route('/get-user-info').get(verifyJWT("User"), getUserInfo);
export default router;