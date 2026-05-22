import type { Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "user create successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "user cannot cerated",
      error: error,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.allUsersIntoDB();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All users",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "user not found",
      error: error,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.singleUserIntoDB(id as string);
    if (result.rows.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "user not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Single users",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "user not found",
      error: error,
    });
  }
};

const userUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUserIntoDB(req.body, id as string);

    if (result.rows.length === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "user not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "updated successfull",
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "cannot update user",
      error: error,
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUserIntoDB(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "delete successfull",
      data: result.rows[0],
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "cannot update user",
      error: error,
    });
  }
};
export const userControllar = {
  createUser,
  getAllUsers,
  getSingleUser,
  userUpdate,
  deleteUser,
};
