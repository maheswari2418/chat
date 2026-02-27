"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Loader2, User } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const register = useMutation(api.users.register);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await register({ name: name.trim() });
      
      if (result.success) {
        // Log user in
        login(result.name, result.displayName || result.name);
        
        // Show notification if name was changed
        if (result.wasRenamed) {
          alert(
            `Name "${result.originalName}" was already taken.\n` +
            `You've been registered as "${result.displayName}"`
          );
        }
        
        // Redirect to chat
        router.push("/");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Chat
          </h1>
          <p className="text-gray-600">
            Enter your name to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
              className="w-full text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Don't worry, we'll make it unique if needed!
            </p>
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
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              "Start Chatting"
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong>
            <br />
            • If your name is taken, we'll add a number (e.g., John → John2)
            <br />
            • You can add friends manually by name
            <br />
            • Start chatting immediately!
          </p>
        </div>
      </div>
    </div>
  );
}