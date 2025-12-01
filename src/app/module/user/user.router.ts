import { Router } from "express";
import { userController } from "./user.controller";
import { multerUpload } from "../../config/multer.config";


const router= Router()

// import user router
router.post("/register", multerUpload.single("profileImage"), userController.createUser);

// router.get("/", userController.getusers)
// router.get("/:id", userController.getSingleUser)
// router.patch("/:id", userController.updateUser)
// router.delete("/:id", userController.deleteUser)

export const userRouter=router