"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { MessageSquarePlus, Users } from "lucide-react";
import ConversationList from "./ConversationList";
import UserSearch from "./user-search";
import GroupCreateModal from "./group";

type Tab = "chats" | "users";

export default function Sidebar() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
        <div className="flex items-center gap-3">
          {/* Clerk prebuilt UserButton — shows avatar + dropdown with sign out */}
          <UserButton
            appearance={{
              elements: { avatarBox: "w-10 h-10" },
            }}
          />
          <span className="text-[#e9edef] font-medium text-sm truncate max-w-[140px]">
            {user.fullName ?? user.username ?? "You"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGroupModal(true)}
            className="p-2 text-[#aebac1] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-full transition-colors"
            title="New group"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTab("users")}
            className="p-2 text-[#aebac1] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-full transition-colors"
            title="New chat"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 bg-[#111b21]">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={
              tab === "chats" ? "Search conversations" : "Search people..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202c33] text-[#e9edef] placeholder-[#8696a0] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a3942]">
        <button
          onClick={() => { setTab("chats"); setSearchQuery(""); }}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === "chats"
              ? "text-[#00a884] border-b-2 border-[#00a884]"
              : "text-[#8696a0] hover:text-[#e9edef]"
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => { setTab("users"); setSearchQuery(""); }}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            tab === "users"
              ? "text-[#00a884] border-b-2 border-[#00a884]"
              : "text-[#8696a0] hover:text-[#e9edef]"
          }`}
        >
          People
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {tab === "chats" ? (
          <ConversationList
            currentUserId={user.id}
            searchQuery={searchQuery}
            onNewChat={() => setTab("users")}
          />
        ) : (
          <UserSearch
            currentUserId={user.id}
            searchQuery={searchQuery}
            onBack={() => setTab("chats")}
          />
        )}
      </div>

      {showGroupModal && (
        <GroupCreateModal
          currentUserId={user.id}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </div>
  );
}