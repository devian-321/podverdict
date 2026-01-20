import { type Response } from "express";
import { type AuthRequest } from "../middlewares/authMiddleware";
import prisma from "../../lib/prisma";

export const createProblem = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, difficulty, testCases } = req.body;
        if (!title || !testCases || !Array.isArray(testCases)) {
            return res.status(400).json({ error: "Title and a list of test cases are required" });
        }
        const newProblem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                authorId: req.user!.userid,
                testCases: {
                    create: testCases.map((tc: any) => ({
                        input: tc.input,
                        expected: tc.expected,
                        isHidden: tc.isHidden ?? true
                    }))
                }
            },
            include: {
                testCases: true
            }
        });

        res.status(201).json(newProblem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create problem" });
    }
};