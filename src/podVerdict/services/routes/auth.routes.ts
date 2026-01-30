import { Router } from "express";
import { register } from "../auth/sign-up/signup.controller";
import { login } from "../auth/sign-in/signin.controller";
const authRouter = Router()

authRouter.post("/signup", register)
authRouter.post("/login", login)


export default authRouter