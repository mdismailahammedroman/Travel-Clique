import express from "express"
import { userRouter } from "../module/user/user.router"

const router=express.Router()
const RouterModule=[
    //import all routers here
    {
        path:"/users",
        route:userRouter,
    }
]

RouterModule.forEach((routers )=> {router.use(routers.path,routers.route)})

export default router;