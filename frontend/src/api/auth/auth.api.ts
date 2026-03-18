import type{ RegisterPayload, AuthResponse, LoginPayload, ProfileResponse } from "../../types/auth.types";
import { api } from "../api";

export const registerUser = async (
  data: RegisterPayload
): Promise<AuthResponse> => {
  const res = await api.post("/users/signup", data);
  return res.data;
};

export const loginUser = async(
    data: LoginPayload
): Promise<AuthResponse> =>{
    const res = await api.post("/users/login", data);
    return res.data
};

export const getUserProfile = async(): Promise<ProfileResponse> =>{
    const res = await api.get("/users/profile", {
        withCredentials: true
    });
    return res.data
}

export const logoutUser = async()=>{
    await api.post("/users/logout", {}, {
        withCredentials: true 
    })
}