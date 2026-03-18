import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "../types"

type AsyncHandler = (
    req: AuthenticatedRequest, 
    res: Response,
    next: NextFunction
)=>Promise<void>

export const asyncHandler = (request: AsyncHandler)=>{
    return (req: AuthenticatedRequest, res: Response, next: NextFunction)=>{
        Promise.resolve(request(req, res, next)).catch((err)=>next(err))
    }
}