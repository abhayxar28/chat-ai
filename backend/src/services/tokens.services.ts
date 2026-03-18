import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateUserToken = (payload: string)=>{
    const token = jwt.sign({id: payload}, JWT_SECRET, {expiresIn: '1d'})
    return token;
};

export const validateUserToken = (token: string)=>{
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
        return payload
    } catch (error) {
        return null
    }
}
