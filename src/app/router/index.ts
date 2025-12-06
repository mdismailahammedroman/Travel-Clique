import express from "express"
import { userRouter } from "../module/user/user.router"
import { authRoute } from "../module/auth/auth.route"
import { otpRoutes } from "../otp/otp.router"
import { travelPlanRoute } from "../module/TravelPlan/travelPlan.route"
import { profileRouter } from "../module/Profile/profile.route"

const router=express.Router()
const RouterModule=[
    //import all routers here
    {
        path:"/users",
        route:userRouter,
    },
    {
        path:"/auth",
        route:authRoute,
    },
    {
        path:"/otp",
        route:otpRoutes,
    } ,
    {
        path:"/profiles",
        route:profileRouter,
    } ,
    {
        path:"/travelplan",
        route:travelPlanRoute,
    } ,
]

RouterModule.forEach((routers )=> {router.use(routers.path,routers.route)})

export default router;