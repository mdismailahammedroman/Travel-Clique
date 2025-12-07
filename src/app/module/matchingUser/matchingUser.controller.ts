import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  STATUS_CODES  from "http-status";

import { matchService } from "./matchingUser.service";
import { IJWTPayload } from "../../helpers/payload";


const sendMatch = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req.user as IJWTPayload).id;
  const { receiverId } = req.body;

  const match = await matchService.sendMatch(senderId, receiverId);

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Match request sent",
    data: match,
  });
});

  export const matchingUserController={
    sendMatch,
  }