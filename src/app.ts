import express, { urlencoded, type Application } from "express";
import { userRoute } from "./modulse/user/user.route";

const app: Application = express();


// middleware
app.use(express.json())
app.use(express.text())
app.use(urlencoded({extended:true}))

// all user route
app.use("/api/users", userRoute);
app.use("/api/users", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);



export default app;
