import { Router } from "express";
import { checkAuth } from "../../config/checkAuth";
import { Role } from "@prisma/client";
import { groupController } from "./travelGroup.controller";

const router = Router();

const auth = checkAuth(Role.USER);

/**
 * GROUP ROUTES
 */

// Public routes
router.get("/search", groupController.searchGroups);
router.get("/:id", groupController.getGroupById);
router.get("/:id/members", groupController.getGroupMembers);

// Protected routes
router.post("/", auth, groupController.createGroup);
router.get("/my/groups", auth, groupController.getMyGroups);
router.put("/:id", auth, groupController.updateGroup);
router.delete("/:id", auth, groupController.deleteGroup);

// Member management
router.post("/:id/join", auth, groupController.joinGroup);
router.post("/:id/leave", auth, groupController.leaveGroup);
router.delete("/:id/members/:memberId", auth, groupController.removeMember);
router.patch(
  "/:id/members/:memberId/role",
  auth,
  groupController.updateMemberRole
);

// Ownership
router.post("/:id/transfer-ownership", auth, groupController.transferOwnership);

export const groupRoute = router;
