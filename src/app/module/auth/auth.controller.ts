import {  Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import statucCodes from "http-status";
import { authServices } from "./auth.services";

const loginUser=catchAsync(async(req:Request,res:Response,)=>{
   
     const result = await authServices.loginUser(req.body,);
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    })
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    })
    sendResponse(res,{
        success:true,
        statusCode:statucCodes.OK,
        message:"User logged in successfully",
        data:result,
    })
})
export const authController={loginUser}