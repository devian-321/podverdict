import { Router } from "express";
import { register } from "../auth/sign-up/signup.controller";

const authRouter = Router()

authRouter.post("/signup", register)


export default authRouter