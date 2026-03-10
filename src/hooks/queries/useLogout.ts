import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";

export const useLogout = () => {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      // Call backend logout if needed
      // await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`);

      // Clear local store
      logout();

      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  return { logout: handleLogout };
};
