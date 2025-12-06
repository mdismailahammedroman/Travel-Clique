import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import STATUS_CODES from "http-status";
import { IJWTPayload } from "../../helpers/payload";
import { travelGroupService } from "./travelGroup.service";

// CREATE
const createTravelGroup = catchAsync(async (req: Request, res: Response) => {
  const creatorId = (req.user as IJWTPayload).id;
  const group = await travelGroupService.createTravelGroup(creatorId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Travel group created successfully",
    data: group,
  });
});

// GET ALL
const getTravelGroups = catchAsync(async (req: Request, res: Response) => {
  const groups = await travelGroupService.getTravelGroups();
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Travel groups fetched successfully",
    data: groups,
  });
});

// GET SINGLE
const getTravelGroup = catchAsync(async (req: Request, res: Response) => {
  const group = await travelGroupService.getTravelGroupById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Travel group fetched successfully",
    data: group,
  });
});

// UPDATE
const updateTravelGroup = catchAsync(async (req: Request, res: Response) => {
  const group = await travelGroupService.updateTravelGroup(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Travel group updated successfully",
    data: group,
  });
});

// DELETE
const deleteTravelGroup = catchAsync(async (req: Request, res: Response) => {
  await travelGroupService.deleteTravelGroup(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Travel group deleted successfully",
  });
});

// ADD MEMBER
const addMember = catchAsync(async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  const member = await travelGroupService.addGroupMember(groupId, userId);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.CREATED,
    message: "Member added successfully",
    data: member,
  });
});

// REMOVE MEMBER
const removeMember = catchAsync(async (req: Request, res: Response) => {
  const { groupId, userId } = req.body;
  await travelGroupService.removeGroupMember(groupId, userId);
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: "Member removed successfully",
  });
});

export const travelGroupController = {
  createTravelGroup,
  getTravelGroups,
  getTravelGroup,
  updateTravelGroup,
  deleteTravelGroup,
  addMember,
  removeMember,
};
