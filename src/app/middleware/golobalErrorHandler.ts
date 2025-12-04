/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";

export const golobalErrorHandler=(err:any,req:Request,res:Response,next:NextFunction)=>{
    let statusCode=err.StatusCode || 500;
    let message=err.message || "Internal Server Error";
    const success=false;
    let error=err;

    if (err instanceof AppError) {
        statusCode=err.StatusCode;
        message=err.message;
        error={message:err.message };
    }




    

   res.status(statusCode).json({
    success,
    message,
    statusCode,
    error,
  });
}