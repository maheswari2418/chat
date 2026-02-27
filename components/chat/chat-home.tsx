"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { ScrollArea } from "@/components/ui";
import { Loader2, UserPlus, LogOut, Users, MessageSquare } from "lucide-react";
import OnlineStatus from "./shared/online-status";
import AddFriendDialog from "./sidebar/add";

export default function ChatHome() {
  const { userName, displayName, logout } = useAuth();
  const router = useRouter();
  const users = useQuery(api.users.getAllUsers, userName ? { currentUserName: userName } : "skip");
  const getOrCreateConversation = useMutation(api.conversations.getOrCreateConversation);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);

  // Set user online
  useEffect(() => {
    if (userName) {
      setOnlineStatus({ userName, isOnline: true });

      const handleBeforeUnload = () => {
        setOnlineStatus({ userName, isOnline: false });
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      const interval = setInterval(() => {
        setOnlineStatus({ userName, isOnline: true });
      }, 30000);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        clearInterval(interval);
        setOnlineStatus({ userName, isOnline: false });
      };
    }
  }, [userName, setOnlineStatus]);

  const handleUserClick = async (otherUserName: string) => {
    if (!userName) return;
    
    setIsCreating(otherUserName);
    try {
      const conversationId = await getOrCreateConversation({
        currentUserName: userName,
        otherUserName,
      });
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to start conversation");
    } finally {
      setIsCreating(null);
    }
  };

  const handleLogout = () => {
    if (userName) {
      setOnlineStatus({ userName, isOnline: false });
    }
    logout();
    router.push("/register");
  };

  // Group users by first letter
  const groupedUsers = users?.reduce((acc, user) => {
    const firstLetter = user.displayName[0]?.toUpperCase() || "#";
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {} as Record<string, typeof users>);

  const letters = groupedUsers ? Object.keys(groupedUsers).sort() : [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-96 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
              <p className="text-sm text-gray-600">Hi, {displayName}!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          <Button onClick={() => setShowAddFriend(true)} className="w-full" size="lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Friend
          </Button>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1 scrollbar-thin">
          {users === undefined ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No friends yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add your first friend to start chatting!
              </p>
              <Button onClick={() => setShowAddFriend(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          ) : (
            <div className="pb-4">
              {letters.map((letter) => (
                <div key={letter}>
                  {/* Letter Header */}
                  <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider z-10">
                    {letter}
                  </div>

                  {/* Users */}
                  <div className="divide-y divide-gray-100">
                    {groupedUsers[letter].map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleUserClick(user.name)}
                        disabled={isCreating === user.name}
                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition text-left disabled:opacity-50"
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {user.displayName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <OnlineStatus isOnline={user.isOnline} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                        {isCreating === user.name && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Empty state */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Select a friend
          </h2>
          <p className="text-gray-500">
            Click on a friend to start chatting
          </p>
        </div>
      </div>

      {/* Add Friend Dialog */}
      {showAddFriend && (
        <AddFriendDialog
          currentUserName={userName!}
          onClose={() => setShowAddFriend(false)}
        />
      )}
    </div>
  );
}