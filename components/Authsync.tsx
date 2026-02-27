"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

export default function AuthSync() {
  const { getToken, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated: convexAuth, isLoading: convexLoading } = useConvexAuth();

  useEffect(() => {
    if (!clerkLoaded) return;

    const setupAuth = async () => {
      try {
        const token = await getToken({ template: "convex" });
        if (token) {
          console.log("Auth synced to Convex");
        }
      } catch (error) {
        console.error("Auth sync failed:", error);
      }
    };

    setupAuth();
  }, [clerkLoaded, getToken]);

  return null;
}