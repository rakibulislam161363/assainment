import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";

const issuesManage = async(req:Request, res:Response) =>{ 
    try {
        const result = await issuesService.issuesIntoDB(req.body);
        sendResponse(res,{
            statusCode: 201,
            success: true,
            message:"Issue created successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "something went wrong",
            error: error
        })
    }


};


export const issuesControllar = {
    issuesManage,
}