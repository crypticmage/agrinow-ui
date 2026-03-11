import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { USERS_QUERY_KEY } from "@/hooks/queries/users";
import { getServerUsers } from "@/lib/server-api";
import { UserManagementClient } from "./UserManagementClient";

export default async function UserManagementPage() {
  const queryClient = getQueryClient();

  // Prefetch data on the server using native fetch to avoid axios deprecation warnings
  await queryClient.prefetchQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getServerUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserManagementClient />
    </HydrationBoundary>
  );
}
