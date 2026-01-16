import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/log/:path*",
    "/chat/:path*",
    "/reports/:path*",
    "/reminders/:path*",
    "/sos/:path*",
  ],
};
