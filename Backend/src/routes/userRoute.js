import {     
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    resetPassword,
    verifyEmail,
    getCurrentUser,} from "../controllers/user.controller.js";
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";

const router=Router();

router.route('/SignUp').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify-email').post(verifyEmail)
router.route('/logout').post(VerifyJWT("User"),logOut);
router.route('/refresh-token').post(VerifyJWT("User"),refreshAccessToken);
router.route('/reset-password').post(resetPassword);
router.route('/get-current-user').get(VerifyJWT("User"),getCurrentUser);

export default router;