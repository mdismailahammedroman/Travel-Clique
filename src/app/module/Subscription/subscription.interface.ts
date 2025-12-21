export interface ICreateCheckoutSession {
  subscriptionType: "MONTHLY" | "YEARLY";
  userId: string;
}

export interface ISubscriptionFilters {
  isActive?: boolean;
}
