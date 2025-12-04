/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../utils/prisma"


const createTravelPlan =async(userId: string, payload: any)=>{
     if (!payload.destination) {
    throw new AppError(400, "Destination is required");
  }
  if (!payload.startDate || !payload.endDate) {
    throw new AppError(400, "Start date and end date are required");
  }
const createPlan=await prisma.travelPlan.create({
    data:{
        userId,
            destination: payload.destination,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetMin: payload.budgetMin,
      budgetMax: payload.budgetMax,
      travelType: payload.travelType,
      description: payload.description,
      visibility: payload.visibility ?? true,
    }
})
return createPlan
}

export const travelPlanService={createTravelPlan}
