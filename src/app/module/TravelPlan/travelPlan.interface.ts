export type TravelType = "SOLO" | "FAMILY" | "FRIENDS";

export interface CreateTravelPlanInput {
  userId: string;
  destination: string;
  country: string;
  city?: string;
  startDate: Date;
  endDate: Date;
  budgetMin?: number;
  budgetMax?: number;
  travelType: TravelType;
  description?: string;
  itinerary?: string;
  interests?: string[];
}

export interface UpdateTravelPlanInput {
  destination?: string;
  country?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
  budgetMin?: number;
  budgetMax?: number;
  travelType?: TravelType;
  description?: string;
  itinerary?: string;
  interests?: string[];
  isActive?: boolean;
}

export interface SearchTravelPlanFilters {
  destination?: string;
  country?: string;
  city?: string;
  startDate?: Date;
  endDate?: Date;
  minBudget?: number;
  maxBudget?: number;
  travelType?: TravelType;
  interests?: string[];
  userId?: string;
  isActive?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
