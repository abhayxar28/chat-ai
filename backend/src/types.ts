import { Request } from "express";
import { IUser } from "./models/user.models";

export interface AuthenticatedRequest extends Request{
    user?: IUser | null
}