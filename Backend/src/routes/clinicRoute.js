import { loginClinic,registerClinic,logoutClinic, getClinic } from "../controllers/clinic.controller.js";
import {Router} from "express"
import VerifyJWT from "../middleware/verifyJWT.js";
import {upload} from "../middleware/multer.js"
const router=Router();

router.route('/signUp').post(upload.single("localLogo"),registerClinic);
router.route('/login').post(loginClinic);
router.route('/logout').post(VerifyJWT("Clinic"),logoutClinic);
router.route('/get-clinic').get(getClinic);

export default router;