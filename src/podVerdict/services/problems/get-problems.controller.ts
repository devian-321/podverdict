import { type Request, type Response } from "express";
import prisma from "../../lib/prisma";

export const getAllProblems = async (req: Request, res: Response) => {
    try {
        const problems = await prisma.problem.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                createdOn: true,
                author: {
                    select: { username: true }
                }
            }
        });
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch problems" });
    }
};