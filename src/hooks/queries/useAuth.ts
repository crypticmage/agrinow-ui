import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useAppStore } from "@/stores/appStore";

interface LoginData {
  identifier: string;
  password: string;
}

export const useLogin = () => {
  const router = useRouter();
  const loginStore = useAppStore();

  const loginFn = async (credentials: LoginData) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      credentials,
    );
    return res.data;
  };

  return useMutation({
    mutationFn: loginFn,
    onSuccess: (data) => {
      toast.success("Login successful!");

      const token: string = data?.access_token;

      if (typeof document !== "undefined" && token) {
        // NOTE: SameSite=Strict & Secure commented out during testing phase
        // (UI and backend are on different origins). Re-enable in production.
        // const isSecure = window.location.protocol === "https:" ? "; Secure" : "";
        // document.cookie = `auth-token=${encodeURIComponent(token)}; Path=/; SameSite=Strict${isSecure}`;
        document.cookie = `auth-token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
      }

      // Update Zustand store with user info from API response
      const username: string | undefined =
        data?.user?.username ?? data?.username;
      const role = data?.user?.role ?? data?.role;
      const email: string = data?.user?.email ?? data?.email ?? "";

      let exp: number | undefined;
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
            const payload = JSON.parse(payloadJson);
            exp = payload.exp;
          }
        } catch (e) {
        }
      }

      if (username && role) {
        loginStore.login(username, email, role, exp);
      }

      // Navigate to dashboard with a flag so it can show its own entry animation.
      router.push("/dashboard?from=login");
      router.refresh(); // re-run server-side checks
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to login");
    },
  });
};
