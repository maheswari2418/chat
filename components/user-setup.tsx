"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button, Input, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { Loader2, User } from "lucide-react";

interface UserSetupProps {
  onComplete: () => void;
}

export default function UserSetup({ onComplete }: UserSetupProps) {
  const { user: clerkUser } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  
  const [name, setName] = useState(clerkUser?.fullName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!clerkUser) throw new Error("Not signed in");
      await upsertUser({
        clerkId: clerkUser.id,
        name: name.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl,
      });
      onComplete();
    } catch (err) {
      console.error("Error creating user:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Chat App!
          </h1>
          <p className="text-gray-600">
            Let's set up your profile to get started
          </p>
        </div>

        {/* Profile Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clerkUser?.imageUrl} />
            <AvatarFallback>
              {name.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {name || "Your Name"}
            </p>
            <p className="text-sm text-gray-500">
              {clerkUser?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
              className="w-full"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Continue to Chat"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Your information is stored securely and can be updated anytime
        </p>
      </div>
    </div>
  );
}
