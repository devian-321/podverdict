import { type Response } from "express";
import { type AuthRequest } from "../middlewares/authMiddleware";
import prisma from "../../lib/prisma";
import { Queue } from "bullmq";


const submissionQueue = new Queue("submission-queue", { connection: { host: process.env.REDIS_HOST || "localhost", port: 6379, maxRetriesPerRequest: null } });

export const submitCode = async (req: AuthRequest, res: Response) => {
    try {
        const { problemId, code, language } = req.body;
        const submission = await prisma.submission.create({
            data: {
                problemId,
                code,
                language: language.toUpperCase(),
                userId: req.user!.userid,
                status: "PENDING"
            }
        });
        await submissionQueue.add("judge-job", {
            submissionId: submission.id,
            problemId,
            code,
            language
        });

        res.status(202).json({
            message: "Submission received and queued",
            submissionId: submission.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to queue submission" });
    }
};


export const getSubmissionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid submission id" });
        }
        const submission = await prisma.submission.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
                language: true,
                createdOn: true,
            }
        });

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};