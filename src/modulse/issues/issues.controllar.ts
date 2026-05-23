import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const issuesManage = async(req:Request, res:Response) =>{ 
    const result = issuesService.issuesIntoDB(req.body);
};


export const issuesControllar = {
    issuesManage,
}