import { Router } from "express";
import { issuesControllar } from "./issues.controllar";

const route = Router()

route.post("/", issuesControllar.issuesManage);
route.get("/", issuesControllar.allIssues);
route.get("/:id", issuesControllar.getSingleIssues);
route.patch("/:id", issuesControllar.updateIssues)
route.delete("/:id", issuesControllar.deleteIssues)
export const issuesRoute = route;