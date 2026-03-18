import { useEffect, useState } from "react";
import { getUserProfile } from "../api/auth/auth.api";
import type { ProfileResponse } from "../types/auth.types";
import type { AxiosError } from "axios";

export const useProfile = () => {
  const [user, setUser] = useState<ProfileResponse["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getUserProfile();
      setUser(res.user);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);



  return {
    user,
    loading,
    error,
    fetchUserProfile,
  };
};