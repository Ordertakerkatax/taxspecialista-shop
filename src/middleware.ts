import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAccountRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
    // Allow admin access by email whitelist or role metadata
    const adminEmails = (process.env.ADMIN_EMAILS ?? "esm.taxconsultant@kataxpayer.com").split(",").map(e => e.trim().toLowerCase());
    const userEmail = session.sessionClaims?.email as string | undefined;
    const metadata = session.sessionClaims?.publicMetadata as { role?: string } | undefined;
    const isAdmin = adminEmails.includes(userEmail?.toLowerCase() ?? "") || metadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isAccountRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
