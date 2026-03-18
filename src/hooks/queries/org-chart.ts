import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { OrgMember } from "@/types/organisation-chart";

export const getOrgChartApi = async (token?: string): Promise<OrgMember> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get("/users/org/chart", { headers });
  return response.data;
};

export const useOrgChart = () => {
  return useQuery({
    queryKey: ["org-chart"],
    queryFn: () => getOrgChartApi(),
    staleTime: 30_000, // 30 s — avoids refetch on every tab focus/navigation
  });
};
