import { Role } from "@prisma/client";

export interface IJWTPayload {
    email: string;
    role: Role;
    id: string; // make sure this exists
}
