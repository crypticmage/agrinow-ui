import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { OrgMember } from "@/types/organisation-chart";

export const getOrgChartApi = async (token?: string): Promise<OrgMember> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axiosInstance.get("/users/org/chart", { headers });
  return response.data;
};

export const useOrgChart = () => {
  return useQuery({
    queryKey: ["org-chart"],
    queryFn: () => getOrgChartApi(),
  });
};
