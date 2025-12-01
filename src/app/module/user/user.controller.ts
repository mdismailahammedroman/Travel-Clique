import {  Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  STATUS_CODES  from "http-status";
import { userService } from "./user.service";


const createUser = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    req.body.profileImage = req.file.path || req.file.filename;
  }

  const result = await userService.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "User created successfully",
    data: result,
  });
});




// const getusers=()=>{}


// const  getSingleUser=()=>{

// }
// const updateUser=()=>{

// }
// const deleteUser=()=>{}

export const userController ={
    createUser,
    // getusers,
    // getSingleUser,
    // updateUser,
    // deleteUser,

}