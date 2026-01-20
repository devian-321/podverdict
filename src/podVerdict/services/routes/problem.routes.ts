import { Router } from "express";
import { verifyToken, authorizeRole } from "../middlewares/authMiddleware";
import { createProblem } from "../problems/create-problem.controller";
import { Role } from "../../../generated/prisma";
import { getAllProblems, getProblemById } from "../problems/get-problems.controller";

const problemRouter = Router();

problemRouter.get("/", getAllProblems)
problemRouter.get("/:id", getProblemById)

problemRouter.post("/", verifyToken, authorizeRole(Role.ADMIN), createProblem);

export default problemRouter;