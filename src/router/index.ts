import express from "express"
import { userRouter } from "../app/module/user/user.router";

const router=express.Router()
const RouterModule=[
    //import all routers here
    {
        path:"/users",
        route:userRouter,
    }
]

export default router;