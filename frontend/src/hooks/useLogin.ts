import { loginUser } from "../api/auth/auth.api"
import type { LoginPayload } from "../types/auth.types";

export const useLogin = ()=>{
    const login = (data: LoginPayload) => {
        return loginUser(data);
    };

    return { login };
}