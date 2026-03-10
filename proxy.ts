import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const tokenCookie = request.cookies.get("auth-token");
  let isAuthenticated = false;

  if (tokenCookie && tokenCookie.value) {
    try {
      const parts = tokenCookie.value.split(".");
      if (parts.length === 3) {
        // Decode the payload (part 1)
        const payloadBase64Url = parts[1];
        const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > currentTime) {
          isAuthenticated = true;
        }
      }
    } catch (e) {
      console.error("Failed to parse token in proxy", e);
    }
  }

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // 1. Unauthenticated users trying to access protected routes go to /login
  if (!isAuthenticated && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (tokenCookie) {
      // Clear the invalid/expired cookie so the browser forgets it
      response.cookies.delete("auth-token");
    }
    return response;
  }

  // 2. Authenticated users trying to access /login go straight to the dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to proceed if checks pass
  return NextResponse.next();
}

// Configure which routes the proxy should intercept
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
