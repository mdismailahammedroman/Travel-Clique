export interface CreateReviewInput {
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}
