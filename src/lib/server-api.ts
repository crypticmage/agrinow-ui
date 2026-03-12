import { cookies } from "next/headers";
import { User } from "@/types/user";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Server-side version of fetching users.
 * This can be called safely in Server Components.
 */
export async function getServerUsers(): Promise<User[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  console.log(`[getServerUsers] Fetching from: ${BACKEND_URL}/users, Token present: ${!!token}`);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}/users`, {
      headers,
      next: { revalidate: 0 }, 
    });

    if (!res.ok) {
      console.error(`getServerUsers error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch (error) {
    console.error("Failed to fetch users on server:", error);
    return [];
  }
}

/**
 * Server-side version of fetching organisation chart.
 */
export async function getServerOrgChart() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  console.log(`[getServerOrgChart] Fetching from: ${BACKEND_URL}/users/org/chart, Token present: ${!!token}`);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}/users/org/chart`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error(`getServerOrgChart error: ${res.status} ${res.statusText}`);
      // Log headers to see if something is missing (don't log the actual token value for security)
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to fetch org chart on server:", error);
    return null;
  }
}
