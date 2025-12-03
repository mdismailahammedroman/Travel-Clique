import { Router } from "express";
import { userController } from "./user.controller";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

// PUBLIC
router.post("/register", multerUpload.single("profileImage"), userController.createUser);

// ADMIN
router.get("/", checkAuth(Role.ADMIN,Role.SUPER_ADMIN), userController.getUsers);
router.get("/:id", checkAuth(...Object.values(Role)), userController.getUser);
router.get("/me", checkAuth(...Object.values(Role)), userController.getCurrentUser);
router.patch("/myprofile-update",   checkAuth(...Object.values(Role)), multerUpload.single("profileImage"), userController.updateUser);

router.delete("/:id", userController.deleteUser);
router.patch("/:id/block", userController.blockUser);
router.patch("/:id/role", userController.updateUserRole); // admin-only


export const userRouter = router;
