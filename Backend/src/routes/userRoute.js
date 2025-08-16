import { registerUser } from "../controllers/user.controller";
import {Router} from "express"

const router=Router();

router.route('/SignUp').post(registerUser);



export default router;