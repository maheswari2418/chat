import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://bursting-redbird-79.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;