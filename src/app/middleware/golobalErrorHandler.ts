import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";

export const golobalErrorHandler=(err:any,req:Request,res:Response,next:NextFunction)=>{
    console.error(err);
    let statusCode=err.StatusCode || 500;
    let message=err.message || "Internal Server Error";
    let success=false;
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