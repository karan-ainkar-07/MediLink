import { loginUser, logOut, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";

const router=Router();

router.route('/SignUp').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(VerifyJWT,logOut);
router.route('/refresh-token').post(refreshAccessToken)

export default router;