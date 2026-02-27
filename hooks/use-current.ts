import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";

export function useCurrentUser() {
  const { userName } = useAuth();
  return useQuery(api.users.getUserByClerkId, userName ? { clerkId: userName } : "skip");
}
