import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../../../generated/prisma';

export interface AuthRequest extends Request {
    user?: {
        userid: string;
        role: Role;
    };
}
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
};
export const authorizeRole = (role: Role) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden: Insufficient Permissions" });
        }
        next();
    };
};