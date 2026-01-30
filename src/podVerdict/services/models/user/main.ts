import { Role } from "../../../../generated/prisma"
export interface User {
    id: string, //UUID
    username: string,
    email: string,
    passwordHash: string,
    role: Role,
    createdOn: Date

}