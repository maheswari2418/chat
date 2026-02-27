"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import UserSetup from "./user-setup";
import { Loader2 } from "lucide-react";

interface OnboardingCheckerProps {
  children: React.ReactNode;
}

export default function OnboardingChecker({ children }: OnboardingCheckerProps) {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    clerkLoaded && isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (clerkLoaded && isSignedIn) {
      if (currentUser !== undefined) {
        setIsChecking(false);
        setShowOnboarding(currentUser === null);
      }
    } else if (clerkLoaded && !isSignedIn) {
      setIsChecking(false);
    }
  }, [clerkLoaded, isSignedIn, currentUser]);

  // Show loading only briefly
  if (isChecking && clerkLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if user doesn't exist
  if (showOnboarding && clerkLoaded && isSignedIn) {
    return <UserSetup onComplete={() => setShowOnboarding(false)} />;
  }

  // Show main app
  return <>{children}</>;
}
