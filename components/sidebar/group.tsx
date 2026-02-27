"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { X, Check, Users } from "lucide-react";

interface Props {
  currentUserId: string;
  onClose: () => void;
}

export default function GroupCreateModal({ currentUserId, onClose }: Props) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const users = useQuery(api.users.getAllUsers, { currentClerkId: currentUserId });
  const createGroup = useMutation(api.conversations.createGroupConversation);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;
    setIsCreating(true);
    try {
      const convoId = await createGroup({
        currentUserId,
        memberIds: selectedUsers,
        groupName: groupName.trim(),
      });
      router.push(`/chat/${convoId}`);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#202c33] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a3942]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-[#e9edef] font-semibold">New Group Chat</h2>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded-full hover:bg-[#2a3942] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Group name (e.g. Team Alpha)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884] mb-4"
          />

          <p className="text-[#8696a0] text-xs mb-3 font-medium uppercase tracking-wider">
            Add members ({selectedUsers.length} selected)
          </p>

          <div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
            {users === undefined && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[#2a3942]" />
                    <div className="h-3 bg-[#2a3942] rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}
            {users?.map((user) => {
              const isSelected = selectedUsers.includes(user.clerkId);
              return (
                <button
                  key={user._id}
                  onClick={() => toggleUser(user.clerkId)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors w-full text-left ${
                    isSelected ? "bg-[#2a3942]" : "hover:bg-[#2a3942]/60"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-medium">
                        {user.name[0]?.toUpperCase()}
                      </div>
                    )}
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center shadow">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e9edef] text-sm font-medium">{user.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#2a3942]">
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUsers.length < 1 || isCreating}
            className="w-full bg-[#00a884] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#02b893] transition-colors"
          >
            {isCreating
              ? "Creating..."
              : `Create Group ${selectedUsers.length > 0 ? `(${selectedUsers.length + 1} members)` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
