import {    
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    resetPassword,
    resumeQueue,
    startClinic,
    closeClinic,
    pauseQueue,
    viewAppointments,
    nextCoupon,
    saveAndSendPrescription,} from '../controllers/doctor.controller.js'

import { getCurrentUser } from '../controllers/user.controller.js';
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
const router=Router();

router.route('/signUp').post(upload.single("profileImage"), registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(VerifyJWT("Doctor"), logOut);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/reset-password').patch(resetPassword);
router.route('/pause-queue').patch(VerifyJWT("Doctor"), pauseQueue);
router.route('/resume-queue').patch(VerifyJWT("Doctor"), resumeQueue);
router.route('/next-coupon').post(VerifyJWT("Doctor"), nextCoupon);
router.route('/save-prescription').post(VerifyJWT("Doctor"), saveAndSendPrescription);
router.route('/view-appointments').get(VerifyJWT("Doctor"), viewAppointments);
router.route('/start-clinic').patch(VerifyJWT("Doctor"), startClinic);
router.route('/close-clinic').patch(VerifyJWT("Doctor"), closeClinic);
router.route('/get-current-user').get(VerifyJWT("Doctor"),getCurrentUser);

export default router;