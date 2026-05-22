import { Router } from "express";
import { userControllar } from "./user.controllar";

const route = Router();

route.post("/", userControllar.createUser)
route.get("/", userControllar.getAllUsers)
route.get("/:id", userControllar.getSingleUser)
route.put("/:id", userControllar.userUpdate)
route.delete("/:id", userControllar.deleteUser)



export const userRoute = route;