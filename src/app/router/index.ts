import express from "express";
// import { userRouter } from "../module/user/user.router"
import { authRoute } from "../module/auth/auth.route";
import { userRouter } from "../module/user/user.router";
// import { otpRoutes } from "../otp/otp.router"
// import { travelPlanRoute } from "../module/TravelPlan/travelPlan.route"
// import { profileRouter } from "../module/Profile/profile.route"
// import { travelGroupRouter } from "../module/travelGroup/travelGroup.route"
// import { matchRouter } from "../module/matchingUser/matchingUser.route"
// import { subscriptionRoute } from "../module/Subscription/subscription.routes"

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
  // {
  //   path:"/otp",
  //   route:otpRoutes,
  // } ,
  // {
  //   path:"/profiles",
  //   route:profileRouter,
  // } ,
  // {
  //   path:"/travelplan",
  //   route:travelPlanRoute,
  // } ,
  // {
  //   path:"/travelgroup",
  //   route:travelGroupRouter,
  // } ,
  // {
  //   path:"/match",
  //   route:matchRouter,
  // } ,
  // {
  //   path:"/subscription",
  //   route:subscriptionRoute,
  // } ,
];

RouterModule.forEach((routers) => {
  router.use(routers.path, routers.route);
});

export default router;
