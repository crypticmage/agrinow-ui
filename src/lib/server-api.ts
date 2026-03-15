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


    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch (error) {
    return [];
  }
}

/**
 * Server-side version of fetching organisation chart.
 */
export async function getServerOrgChart() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;


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


    return await res.json();
  } catch (error) {
    return null;
  }
}
