"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button, Input } from "@/components/ui";
import { X, Loader2, UserPlus } from "lucide-react";

interface AddFriendDialogProps {
  currentUserName: string;
  onClose: () => void;
}

export default function AddFriendDialog({ currentUserName, onClose }: AddFriendDialogProps) {
  const [friendName, setFriendName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const addFriend = useMutation(api.users.addFriend);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friendName.trim()) {
      setError("Please enter a name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await addFriend({
        currentUserName,
        friendName: friendName.trim(),
      });

      if (result.success) {
        if (result.wasRenamed) {
          alert(
            `Friend "${friendName}" was already registered.\n` +
            `Added as "${result.displayName}" instead.`
          );
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Add friend error:", err);
      setError(err.message || "Failed to add friend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="friendName" className="block text-sm font-medium text-gray-700 mb-2">
              Friend's Name
            </label>
            <Input
              id="friendName"
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Enter friend's name"
              disabled={isLoading}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll add a number if the name is taken
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !friendName.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Friend
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}