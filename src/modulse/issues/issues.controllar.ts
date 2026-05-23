import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";

const issuesManage = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.issuesIntoDB(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "something went problem",
      error: error,
    });
  }
};

const allIssues = async (req: Request, res: Response) => {
  try {
    const sort = req.query.sort || "newest";
    const result = await issuesService.allIssuesIntoDB(sort as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "all issue is here",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "cannot find out all issues",
      error: error,
    });
  }
};

const getSingleIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issuesService.singleIssuesIntoDB(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "single issues",
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "something went problem",
      error: error,
    });
  }
};

const updateIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issuesService.updateIssuesIntoDB(
      req.body,
      id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "update issues",
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "issues cannot update",
      error: error,
    });
  }
};


const deleteIssues = async(req:Request, res:Response)=>{
 try {
    const {id} = req.params;
    const result = await issuesService.deleteIssuesIntoDB(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: result.rows[0],
    });
    
 } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "issues cannot deleted",
      error: error,
    });
 }
}

export const issuesControllar = {
  issuesManage,
  allIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};
