export type TravelType = "SOLO" | "FAMILY" | "FRIENDS";

export interface createTravelPlanInput {
  destination: string;
  startDate: Date | string;
  endDate: Date | string;
  budgetMin?: number;
  budgetMax?: number;
  travelType: TravelType;
  description?: string;
  visibility?: boolean;
  travelGroupId?: string; // optional
}

export interface updateTravelPlanInput {
  destination?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  budgetMin?: number;
  budgetMax?: number;
  travelType?: TravelType;
  description?: string;
  visibility?: boolean;
  travelGroupId?: string; // optional
}
