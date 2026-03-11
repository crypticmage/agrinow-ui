import axiosInstance from "@/lib/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@/types/user";

export const USERS_QUERY_KEY = ["users"] as const;

// API functions
export const getAllUsersApi = async (token?: string): Promise<User[]> => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  const response = await axiosInstance.get("/users", config);
  // Handle both { data: [] } and plain array responses
  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
};

export const createUserApi = async (payload: Partial<User>): Promise<User> => {
  const response = await axiosInstance.post("/create_user/", payload);
  return response.data;
};

export const updateUserApi = async ({
  id,
  payload,
}: {
  id: number;
  payload: Partial<User>;
}): Promise<User> => {
  const response = await axiosInstance.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};

//Hooks
export const useUsers = () =>
  useQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => getAllUsersApi(),
    staleTime: 30_000,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success("User created successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success("User updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success("User deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to delete user");
    },
  });
};
