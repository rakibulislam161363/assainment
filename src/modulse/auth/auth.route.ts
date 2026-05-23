import { Router } from "express";
import { authController } from "./auth.controllar";

const route = Router()

route.post("/", authController.loginUser);
route.post("/refresh-token", authController.refreshToken)

export const authRoute = route;