import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  STATUS_CODES  from "http-status";

import { matchService } from "./matchingUser.service";
import { IJWTPayload } from "../../helpers/payload";
import pick from "../../helpers/pick";


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

const updateMatchStatus = catchAsync(async (req: Request, res: Response) => {
  const receiverId = (req.user as IJWTPayload).id;
  const { matchId, status } = req.body;

  const updated = await matchService.updateMatchStatus(
    matchId,
    receiverId,
    status
  );

  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Match status updated",
    data: updated,
  });
});


const getSentMatches = catchAsync(async (req, res) => {
  const userId = (req.user as IJWTPayload).id;

  const filters = pick(req.query, ["status"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await matchService.getSentMatches(userId, filters, options);

  sendResponse(res, {
    statusCode:STATUS_CODES.OK,
    success: true,
    message: "Sent matches fetched successfully",
    data: result,
  });
});

const getReceivedMatches = catchAsync(async (req, res) => {
  const userId =( req.user as IJWTPayload).id;

  const filters = pick(req.query, ["status"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await matchService.getReceivedMatches(userId, filters, options);

  sendResponse(res, {
     statusCode:STATUS_CODES.OK,
    success: true,
    message: "Received matches fetched successfully",
    data: result,
  });
});

  export const matchingUserController={
    sendMatch,
    updateMatchStatus,
    getReceivedMatches,
    getSentMatches,
  }