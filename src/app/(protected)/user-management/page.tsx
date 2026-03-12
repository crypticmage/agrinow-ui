import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { USERS_QUERY_KEY } from "@/hooks/queries/users";
import { getServerUsers, getServerOrgChart } from "@/lib/server-api";
import { UserManagementClient } from "./UserManagementClient";

export default async function UserManagementPage() {
  const queryClient = getQueryClient();

  // Prefetch data on the server using native fetch to avoid axios deprecation warnings
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: USERS_QUERY_KEY,
      queryFn: getServerUsers,
    }),
    queryClient.prefetchQuery({
      queryKey: ["org-chart"],
      queryFn: getServerOrgChart,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserManagementClient />
    </HydrationBoundary>
  );
}
