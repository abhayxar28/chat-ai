import { useState } from "react";
import { registerUser } from "../api/auth/auth.api"
import type { RegisterPayload } from "../types/auth.types";

export const useRegister = ()=>{
    const [loading, setLoading] = useState(false);
    const register = async(data: RegisterPayload)=>{
        setLoading(true);
        try {
            const response = await registerUser(data);
            return response;
        } catch (error) {
            throw error
        } finally {
            setLoading(false);
        }
    }
    return {register, loading}
}