import { Request } from "express";

export type AuthenticatedUser = {
    id: string;
    role: "user" | "trainer" | "admin";
};

export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
