import { Router, type Response } from "express";
import { verifyToken, type AuthRequest } from "../middlewares/authMiddleware";

const userRouter = Router();

userRouter.get("/profile", verifyToken, (req: AuthRequest, res: Response) => {
    res.json({
        message: "This is a protected route",
        yourData: req.user
    });
});

export default userRouter;