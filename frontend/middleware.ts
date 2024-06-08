export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/archive", "/archive/:id*"],
};
