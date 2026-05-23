import { Router } from "express";
import { userControllar } from "./user.controllar";
import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";

const route = Router();

route.post("/", userControllar.createUser)
route.get("/", auth(USER_ROLE.maintainer),userControllar.getAllUsers)
route.get("/:id", userControllar.getSingleUser)
route.put("/:id", userControllar.userUpdate)
route.delete("/:id", userControllar.deleteUser)



export const userRoute = route;