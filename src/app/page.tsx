// Server Component: redirect based on cookie presence
// (Full server-auth requires HttpOnly cookie from backend)
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (token?.value) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
