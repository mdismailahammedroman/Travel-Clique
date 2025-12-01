import express from "express"
import { userRouter } from "../module/user/user.router"
import { authRoute } from "../module/auth/auth.route"

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
    }
]

RouterModule.forEach((routers )=> {router.use(routers.path,routers.route)})

export default router;