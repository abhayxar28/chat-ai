import { userModel } from '../models/user.models.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateUserToken } from '../services/tokens.services.js';

export const authenticateJWT = asyncHandler(async(req, res, next)=>{
    const { token } = req.cookies;

    if(!token){
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }

    const decoded = validateUserToken(token);
    const user = await userModel.findById(decoded?.id).select('-password')
    req.user = user
    next();

})