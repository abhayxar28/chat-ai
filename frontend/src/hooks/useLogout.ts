import { logoutUser } from "../api/auth/auth.api";

export const useLogout = () => {
  const logout = async () => {
    await logoutUser();
  };

  return { logout };
};
