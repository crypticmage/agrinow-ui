import { cookies } from "next/headers";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  // Accessing cookies forces this page to be dynamic (SSR)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  return <DashboardClient />;
}
