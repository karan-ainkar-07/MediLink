import {  registerUser,loginUser,logOut,refreshAccessToken,resetPassword,} from '../controllers/doctor.controller.js'
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
const router=Router();

router.route('/SignUp').post(upload.single("profileImage"),registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(VerifyJWT,logOut);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/reset-password').post(resetPassword);

export default router;