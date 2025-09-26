import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
import { BookAppointment, getCouponStats, getDoctor, getDoctors } from "../controllers/userProfile.controller.js";

const router=Router();

router.route('/get-doctors').get(getDoctors);
router.route('get-coupoun-stats').get(getCouponStats);
router.route('book-appointment').post(BookAppointment);
router.route('/get-doctor').get(getDoctor);

export default router;