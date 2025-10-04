import {  registerUser,loginUser,logOut,refreshAccessToken} from '../controllers/doctor.controller.js'
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
const router=Router();

router.route('/signUp').post(upload.single("profileImage"),registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(VerifyJWT("Doctor"),logOut);
router.route('/refresh-token').post(refreshAccessToken);
// router.route('/reset-password').post(resetPassword);
// router.route('/pause-queue').post(VerifyJWT("Doctor"),pauseQueue);
// router.route('/resume-queue').post(VerifyJWT("Doctor"),resumeQueue);
// router.route('/next-coupon').post(VerifyJWT("Doctor"),nextCoupon);
// router.route('save-prescription').post(VerifyJWT("Doctor"),saveAndSendPrescription);

export default router;