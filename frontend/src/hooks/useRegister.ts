import { registerUser } from "../api/auth/auth.api"
import type { RegisterPayload } from "../types/auth.types";

export const useRegister = ()=>{
    const register = async(data: RegisterPayload)=>{
        try {
            const response = await registerUser(data);
            return response;
        } catch (error) {
            throw error
        }
    }
    return {register}
}