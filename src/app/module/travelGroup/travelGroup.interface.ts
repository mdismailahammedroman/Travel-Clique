export interface createTravelGroupInput {
  name: string;
  destination: string;
  startDate: Date | string;
  endDate: Date | string;
  isPaidGroup?: boolean;
}

export interface updateTravelGroupInput {
  name?: string;
  destination?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isPaidGroup?: boolean;
}
