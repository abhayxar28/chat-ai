import { useEffect, useState } from "react";
import { getUserProfile } from "../api/auth/auth.api";
import type { ProfileResponse } from "../types/auth.types";

export const useSession = () => {
  const [session, setSession] = useState<ProfileResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getUserProfile();
        setSession(res.user);
      } catch (error) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { session, loading };
};