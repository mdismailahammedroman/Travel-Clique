import { Router } from "express";


const router= Router()

// import user router
router.post("/register", userController.createUser)
router.get("/", userController.getusers)
router.get("/:id", userController.getSingleUser)
router.patch("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)

export const userRouter=router