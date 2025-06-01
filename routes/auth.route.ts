import { Router } from "express";
import { authController } from "../controller/auth.controller";


const authRoute = Router();

authRoute.post("/sign-up", authController.signUp);
authRoute.post("/login", authController.login);
authRoute.post("/verify", authController.verify);


export default authRoute;