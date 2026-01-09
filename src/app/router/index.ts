import express from "express";
import { authRoute } from "../module/auth/auth.route";
import { userRouter } from "../module/user/user.router";
import { otpRoutes } from "../otp/otp.router";
import { travelPlanRoute } from "../module/TravelPlan/travelPlan.route";
import { profileRouter } from "../module/Profile/profile.route";
import { matchRoute } from "../module/matchingUser/matchingUser.route";
import { groupRoute } from "../module/travelGroup/travelGroup.route";
import { subscriptionRoute } from "../module/Subscription/subscription.routes";
import { adminRoute } from "../module/admin/admin.route";

const router = express.Router();
const RouterModule = [
  //import all routers here
  {
    path: "/users",
    route: userRouter,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/otp",
    route: otpRoutes,
  },
  {
    path: "/profiles",
    route: profileRouter,
  },
  {
    path: "/travel-plan",
    route: travelPlanRoute,
  },
  {
    path: "/travel-group",
    route: groupRoute,
  },
  {
    path: "/match",
    route: matchRoute,
  },
  {
    path: "/subscription",
    route: subscriptionRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
];

RouterModule.forEach((routers) => {
  router.use(routers.path, routers.route);
});

export default router;
