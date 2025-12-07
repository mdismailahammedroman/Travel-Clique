import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { travelGroupService } from "./travelGroup.service";
import { IJWTPayload } from "../../helpers/payload";

const createGroup = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IJWTPayload;

  const result = await travelGroupService.createGroup(user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Group created successfully",
    data: result,
  });
});

const getGroups = catchAsync(async (req: Request, res: Response) => {
  const result = await travelGroupService.getGroups();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Groups retrieved",
    data: result,
  });
});

const getGroupById = catchAsync(async (req, res) => {
  const result = await travelGroupService.getGroupById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Group fetched",
    data: result,
  });
});

const joinGroup = catchAsync(async (req, res) => {
  const user = req.user as IJWTPayload;

  const result = await travelGroupService.joinGroup(user.id, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Joined group",
    data: result,
  });
});

const leaveGroup = catchAsync(async (req, res) => {
  const user = req.user as IJWTPayload;

  const result = await travelGroupService.leaveGroup(user.id, req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Left group",
    data: result,
  });
});

const getGroupMembers = catchAsync(async (req, res) => {
  const result = await travelGroupService.getGroupMembers(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Group members retrieved",
    data: result,
  });
});

export const TravelGroupController = {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupMembers,
};
