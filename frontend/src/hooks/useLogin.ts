import { useState } from "react";
import { loginUser } from "../api/auth/auth.api"
import type { LoginPayload } from "../types/auth.types";

export const useLogin = ()=>{
    const [loading, setLoading] = useState(false);
    const login = (data: LoginPayload) => {
        setLoading(true);
        return loginUser(data).finally(() => setLoading(false));
    };

    return { login, loading };
}