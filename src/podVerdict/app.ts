import express, { type Application, type NextFunction, type Request, type Response } from 'express'
import dotenv from 'dotenv'
import { Role } from '../generated/prisma';
import authRouter from "./services/routes/auth.routes"
import userRouter from './services/routes/user.routes';

dotenv.config();

const app: Application = express()

app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);


app.get('/Health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'PodVerdict API is running' });
});




export default app