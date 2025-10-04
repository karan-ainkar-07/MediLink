import {Router} from "express"
import verifyJWT from "../middleware/verifyJWT.js"
import { BookAppointment, getCouponStats, getDoctor, getDoctors } from "../controllers/userProfile.controller.js";

const router=Router();

router.route('/get-doctors').get(getDoctors);
router.route('/get-coupon-stats').get(getCouponStats);
router.route('/book-appointment').post(verifyJWT("User"),BookAppointment);
router.route('/get-doctor').get(getDoctor);

export default router;