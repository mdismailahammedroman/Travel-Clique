/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { Prisma } from "@prisma/client";

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

   
  // Handle Prisma P2025 error (record not found)
  else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
    error = { message };
  }



    

   res.status(statusCode).json({
    success,
    message,
    statusCode,
    error,
  });
}