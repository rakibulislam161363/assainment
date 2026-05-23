import { Router } from "express";
import { issuesControllar } from "./issues.controllar";

const route = Router()

route.post("/", issuesControllar.issuesManage)

export const issuesRoute = route;