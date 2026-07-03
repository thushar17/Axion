import { useState, useEffect } from "react";
import { checkAuth } from "../services/auth.service";
import { socket } from "@/src/lib/socket";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await checkAuth();
        setUser(response.data.user);
        socket.connect();
        setLoading(false);
      } catch (error) {
        console.log(error);
        router.push("/auth/login");
      }
    };
    verifyAuth();
  }, [router]);

  return { user, setUser, loading };
}
