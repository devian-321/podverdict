import { ROLES } from "../../../dataclasses/enums"
export interface User {
    id: string, //UUID
    username: string,
    email: string,
    passwordHash: string,
    role: ROLES,
    createdOn: Date

}