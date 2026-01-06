import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IJWTPayload } from "../../helpers/payload";
import { matchService } from "./matchingUser.service";
import { StatusCodes } from "http-status-codes";

export const sendMatch = catchAsync(async (req: Request, res: Response) => {
  const senderId = (req.user as IJWTPayload).id;
  const { receiverId, travelPlanId, message } = req.body;

  const match = await matchService.sendMatchRequest({
    senderId,
    receiverId,
    travelPlanId,
    message,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Match request sent",
    data: match,
  });
});

export const respondMatch = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJWTPayload).id;
  const { matchId, status } = req.body;

  const updatedMatch = await matchService.respondToMatchRequest(
    matchId,
    userId,
    status
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Match request updated",
    data: updatedMatch,
  });
});

export const getSentMatches = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as IJWTPayload).id;
    const filters = req.query;
    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const matches = await matchService.getSentMatches(userId, filters, options);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Sent matches fetched",
      data: matches,
    });
  }
);

export const getReceivedMatches = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as IJWTPayload).id;
    const filters = req.query;
    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const matches = await matchService.getReceivedMatches(
      userId,
      filters,
      options
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Received matches fetched",
      data: matches,
    });
  }
);

export const getMatchById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJWTPayload).id;
  const { id } = req.params;

  const match = await matchService.getMatchById(id as string, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Match fetched",
    data: match,
  });
});

export const cancelMatchRequest = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as IJWTPayload).id;
    const { id } = req.params;

    const result = await matchService.cancelMatchRequest(id as string, userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
);

export const getMatchStats = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJWTPayload).id;

  const stats = await matchService.getMatchStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Match stats fetched",
    data: stats,
  });
});

export const getMatchedUsers = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req.user as IJWTPayload).id;
    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const matches = await matchService.getMatchedUsers(userId, options);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Matched users fetched",
      data: matches,
    });
  }
);

export const matchingUserController = {
  sendMatch,
  getReceivedMatches,
  getSentMatches,
  respondMatch,
  getMatchById,
  cancelMatchRequest,
  getMatchStats,
  getMatchedUsers,
};
