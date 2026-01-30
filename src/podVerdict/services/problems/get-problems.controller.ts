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

export const getProblemById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Problem ID is required" });
        }

        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                testCases: true
            }
        });

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.status(200).json({
            message: "Problem retrieved successfully",
            problem
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};