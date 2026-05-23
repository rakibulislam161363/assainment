import express, { urlencoded, type Application } from "express";
import { userRoute } from "./modulse/user/user.route";
import { authRoute } from "./modulse/auth/auth.route";
import { issuesRoute } from "./modulse/issues/issues.route";

const app: Application = express();


// middleware
app.use(express.json())
app.use(express.text())
app.use(urlencoded({extended:true}))

// all user route
app.use("/api/auth/signup", userRoute);
app.use("/api/users", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);


// auth route
app.use("/api/auth/login", authRoute);
app.use("/api", authRoute);


// issues route
app.use("/api/issues", issuesRoute)
// app.use("/api/issues", issuesRoute)


export default app;
