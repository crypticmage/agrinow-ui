import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // The proxy reads a cookie instead of your client-side Zustand state
  const isAuthenticated = request.cookies.has("auth-token");
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // 1. Unauthenticated users trying to access protected routes go to /login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
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
