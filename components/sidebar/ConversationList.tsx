// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { UserButton, useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import ConversationItem from "./ConversationItem";
// import AllUsersList from "./user-list";
// import { ScrollArea } from "@/components/ui";
// import { Loader2, MessageSquare, Users } from "lucide-react";

// export default function ConversationList() {
//   const router = useRouter();
//   const { isLoaded: clerkLoaded, isSignedIn } = useUser();
//   const currentUser = useQuery(api.users.getCurrentUser);
//   const conversations = useQuery(api.conversations.getMyConversations);
//   const setOnlineStatus = useMutation(api.users.setOnlineStatus);
//   const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");

//   // Set user online when component mounts
//   useEffect(() => {
//     if (clerkLoaded && isSignedIn && currentUser) {
//       setOnlineStatus({ isOnline: true }).catch(console.error);

//       const handleBeforeUnload = () => {
//         setOnlineStatus({ isOnline: false }).catch(console.error);
//       };

//       window.addEventListener("beforeunload", handleBeforeUnload);

//       const interval = setInterval(() => {
//         setOnlineStatus({ isOnline: true }).catch(console.error);
//       }, 30000);

//       return () => {
//         window.removeEventListener("beforeunload", handleBeforeUnload);
//         clearInterval(interval);
//         setOnlineStatus({ isOnline: false }).catch(console.error);
//       };
//     }
//   }, [clerkLoaded, isSignedIn, currentUser, setOnlineStatus]);

//   // ✅ CRITICAL FIX: Don't wait for currentUser if Clerk is loaded
//   const isReady = clerkLoaded && isSignedIn;

//   return (
//     <div className="flex flex-col h-screen bg-white">
//       {/* Header */}
//       <div className="p-4 border-b bg-white flex-shrink-0">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
//           <UserButton afterSignOutUrl="/sign-in" />
//         </div>

//         {/* Tabs */}
//         {isReady && (
//           <div className="flex gap-2">
//             <button
//               onClick={() => setActiveTab("chats")}
//               className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
//                 activeTab === "chats"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               <MessageSquare className="h-4 w-4" />
//               Chats
//             </button>
//             <button
//               onClick={() => setActiveTab("users")}
//               className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
//                 activeTab === "users"
//                   ? "bg-blue-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               <Users className="h-4 w-4" />
//               All Users
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       {!isReady ? (
//         // Loading state
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
//             <p className="text-sm text-gray-600">Loading...</p>
//           </div>
//         </div>
//       ) : activeTab === "chats" ? (
//         // Chats Tab
//         <ScrollArea className="flex-1 scrollbar-thin">
//           {conversations === undefined ? (
//             <div className="p-4 text-center">
//               <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
//             </div>
//           ) : conversations.length === 0 ? (
//             <div className="p-8 text-center">
//               <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
//                 <MessageSquare className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-1">
//                 No conversations yet
//               </h3>
//               <p className="text-sm text-gray-500">
//                 Switch to "All Users" tab to start chatting
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {conversations.map((conversation) => (
//                 <ConversationItem
//                   key={conversation._id}
//                   conversation={conversation}
//                   onClick={() =>
//                     router.push(`/conversations/${conversation._id}`)
//                   }
//                 />
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       ) : (
//         // All Users Tab
//         <AllUsersList />
//       )}
//     </div>
//   );
// }
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { formatMessageTime } from "@/lib/formattime";
import OnlineIndicator from "@/components/chat/TypingIndicator";
import { MessageSquare, Users } from "lucide-react";

interface Props {
  currentUserId: string;
  searchQuery: string;
  onNewChat: () => void;
}

export default function ConversationList({ currentUserId, searchQuery, onNewChat }: Props) {
  const router = useRouter();
  const params = useParams();
  const activeId = params?.conversationId as string | undefined;

  const conversations = useQuery(api.conversations.getUserConversations, {
    userId: currentUserId,
  });

  // Skeleton loader
  if (conversations === undefined) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[#2a3942] flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-[#2a3942] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#2a3942] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filtered = searchQuery
    ? conversations.filter((c) => {
        const name = c.isGroup ? c.groupName : c.otherUsers[0]?.name ?? "";
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  // Empty state
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center mt-4">
        <MessageSquare className="w-12 h-12 text-[#2a3942] mb-4" />
        <p className="text-[#8696a0] text-sm font-medium">
          {searchQuery ? "No conversations found" : "No chats yet"}
        </p>
        {!searchQuery && (
          <button
            onClick={onNewChat}
            className="mt-3 text-[#00a884] text-sm hover:underline"
          >
            Find someone to chat with →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((convo) => {
        const isActive = activeId === convo._id;
        const isGroup = convo.isGroup;
        const displayName = isGroup
          ? convo.groupName ?? "Group"
          : convo.otherUsers[0]?.name ?? "Unknown";
        const avatarUrl = isGroup ? null : convo.otherUsers[0]?.imageUrl;
        const otherUserId = isGroup ? null : convo.otherUsers[0]?.clerkId;
        const lastText = convo.lastMessage?.isDeleted
          ? "This message was deleted"
          : convo.lastMessage?.text ?? "";

        return (
          <button
            key={convo._id}
            onClick={() => router.push(`/chat/${convo._id}`)}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors text-left w-full ${
              isActive ? "bg-[#2a3942]" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
              ) : isGroup ? (
                <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-semibold text-lg">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              {otherUserId && <OnlineIndicator userId={otherUserId} small />}
            </div>

            {/* Text info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[#e9edef] font-medium text-sm truncate">
                  {displayName}
                </span>
                {convo.lastMessage && (
                  <span className="text-[#8696a0] text-[11px] flex-shrink-0 ml-2">
                    {formatMessageTime(convo.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate flex-1 ${
                  convo.lastMessage?.isDeleted ? "italic text-[#8696a0]" : "text-[#8696a0]"
                }`}>
                  {lastText || "Start a conversation"}
                </p>
                {convo.unreadCount > 0 && (
                  <span className="ml-2 bg-[#00a884] text-white text-[10px] rounded-full min-w-[20px] h-5 flex items-center justify-center flex-shrink-0 font-semibold px-1">
                    {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}