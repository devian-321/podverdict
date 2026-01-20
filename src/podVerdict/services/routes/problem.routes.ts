import { Router } from "express";
import { verifyToken, authorizeRole } from "../middlewares/authMiddleware";
import { createProblem } from "../problems/create-problem.controller";
import { Role } from "../../../generated/prisma";

const problemRouter = Router();

problemRouter.post("/", verifyToken, authorizeRole(Role.ADMIN), createProblem);

export default problemRouter;