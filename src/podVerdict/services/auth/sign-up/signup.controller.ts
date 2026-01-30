import { type Request, type Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { Role } from "../../../../generated/prisma";
import { type User } from "../../models/user/main";
import prisma from "../../../lib/prisma"


export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" })
        }
        if (typeof username !== 'string') {
            return res.status(400).json({ error: `username should be type string, recieved: ${typeof username}` })
        }
        if (typeof password !== 'string') {
            return res.status(400).json({ error: `password should be type string, recieved: ${typeof password}` })
        }
        if (typeof email !== 'string') {
            return res.status(400).json({ error: `email should be type string, recieved: ${typeof email}` })
        }
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existingUser) {
            return res.status(400).json({ error: "Username or Email already taken" });
        }

        const passwordHash = await bcrypt.hash(password, 12)
        const newUser: User = {
            id: uuidv4(),
            username,
            email,
            passwordHash,
            role: Role.CONTESTANT,
            createdOn: new Date()
        };
        const userCreated = await prisma.user.create({ data: newUser })
        const token = jwt.sign({ userid: newUser.id, role: newUser.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '24h' })
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: newUser.id, username: newUser.username }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });

    }
};