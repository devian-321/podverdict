import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { submissionLimiter } from "../middlewares/rateLimiter";
import { submitCode, getSubmissionStatus } from "../submissions/submit.controller";


const submissionRouter = Router();

submissionRouter.post("/submit", verifyToken, submissionLimiter, submitCode);
submissionRouter.get("/:id", verifyToken, getSubmissionStatus);

export default submissionRouter;