import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import STATUS_CODES from "http-status";
import { IJWTPayload } from "../../helpers/payload";
import { travelGroupService } from "./travelGroup.service";
import AppError from "../../errorHelpers/AppError";


// ADD / JOIN MEMBER WITH SUBSCRIPTION CHECK
const addMember = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as IJWTPayload).id; // Authenticated user
  const { planId } = req.body;

  if (!planId) throw new AppError(400, "planId is required");

  const result = await travelGroupService.joinPlan(userId, planId);

  // If user needs a subscription, return the checkout URL
  if (result.requiresSubscription) {
    sendResponse(res, {
      success: false,
      statusCode: STATUS_CODES.PAYMENT_REQUIRED,
      message: result.message,
      data: { checkoutUrl: result.checkoutUrl },
    });
    return;
  }

  // Otherwise, return the updated group
  sendResponse(res, {
    success: true,
    statusCode: STATUS_CODES.OK,
    message: result.message,
    data: result.group,
  });
});


// REMOVE MEMBER
const removeMember = catchAsync(async (req, res) => {
  const { groupId, userId } = req.body;
  if (!groupId || !userId) {
    throw new AppError(400, "groupId and userId are required");
  }

  const result = await travelGroupService.removeGroupMember(
    groupId as string,
    userId as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Member removed successfully",
    data: result,
  });
});


export const travelGroupController = {
  addMember,
  removeMember,
};
