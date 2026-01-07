import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../config/checkAuth";

const router = Router();
const auth = checkAuth("USER"); // Only authenticated users

// Create a review
router.post("/", auth, reviewController.createReview);

// Get reviews I gave
router.get("/my-reviews", auth, reviewController.getMyReviews);

// Check if I can review a user
router.get("/can-review/:reviewedId", auth, reviewController.checkCanReview);

// Get reviews for a specific user (public)
router.get("/user/:userId", reviewController.getUserReviews);

// Get rating distribution for a user (public)
router.get(
  "/user/:userId/distribution",
  reviewController.getRatingDistribution
);

// Get review by ID (public)
router.get("/:id", reviewController.getReviewById);

// Update a review
router.patch("/:id", auth, reviewController.updateReview);

// Delete a review
router.delete("/:id", auth, reviewController.deleteReview);

export const reviewRoute = router;
