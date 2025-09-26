import { loginClinic,registerClinic,logoutClinic } from "../controllers/clinic.controller.js";
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
const router=Router();

router.route('/SignUp').post(upload.single("localLogo"),registerClinic);
router.route('/login').post(loginClinic);
router.route('/logout').post(VerifyJWT("Clinic"),logoutClinic);

export default router;