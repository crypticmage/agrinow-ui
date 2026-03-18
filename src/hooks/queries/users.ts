import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@/types/user";

export const USERS_QUERY_KEY = ["users"] as const;

// API functions
export const getAllUsersApi = async (token?: string): Promise<User[]> => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
  const response = await api.get("/users/", config);
  // Handle both { data: [] } and plain array responses
  return Array.isArray(response.data)
    ? response.data
    : response.data.data ?? [];
};

export const createUserApi = async (payload: Partial<User>): Promise<User> => {
  const response = await api.post("/create_user/", payload);
  return response.data;
};

export const updateUserApi = async ({
  id,
  payload,
}: {
  id: number;
  payload: Partial<User>;
}): Promise<User> => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

//Hooks
export const useUsers = () =>
  useQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => getAllUsersApi(),
    staleTime: 30_000,
  });

// FastAPI returns detail as either a string or an array of validation error objects.
// Always produce a plain string for toast.
function apiError(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg ?? String(e)).join('; ');
  }
  return String(detail);
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success("User created successfully");
    },
    onError: (err: any) => {
      toast.error(apiError(err, "Failed to create user"));
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
      toast.error(apiError(err, "Failed to update user"));
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
      toast.error(apiError(err, "Failed to delete user"));
    },
  });
};

export function useManagerDropdown(enabled = true) {
  return useQuery({
    queryKey: ['users', 'manager-dropdown'],
    queryFn: async () => {
      const { data } = await api.get<{ id: number; username: string; first_name: string; last_name: string }[]>(
        '/users/manager_dropdown'
      )
      return data
    },
    enabled,
    staleTime: 5 * 60_000, // cache 5 minutes — managers list rarely changes
  })
}
