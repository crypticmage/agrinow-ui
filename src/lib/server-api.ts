import { cookies } from "next/headers";
import { User } from "@/types/user";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Server-side version of fetching users.
 * This can be called safely in Server Components.
 */
export async function getServerUsers(): Promise<User[]> {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("auth-token")?.value;

  try {
    const res = await fetch(`${BACKEND_URL}/users`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      // Ensure we don't cache this indefinitely if it's dynamic
      next: { revalidate: 0 }, 
    });

    if (!res.ok) {
      console.error(`Server API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch (error) {
    console.error("Failed to fetch users on server:", error);
    return [];
  }
}
