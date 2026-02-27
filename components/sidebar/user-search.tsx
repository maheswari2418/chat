// "use client";

// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
// import { ScrollArea } from "@/components/ui";
// import { Search, X, Loader2 } from "lucide-react";
// import OnlineStatus from "@/components/chat/shared/online-status";
// import { Button } from "@/components/ui";

// interface UserSearchProps {
//   onClose: () => void;
// }

// export default function UserSearch({ onClose }: UserSearchProps) {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const users = useQuery(
//     api.users.searchUsers,
//     searchQuery ? { searchQuery } : "skip"
//   );
//   const allUsers = useQuery(api.users.getAllUsers);
//   const getOrCreateConversation = useMutation(
//     api.conversations.getOrCreateConversation
//   );
//   const [isCreating, setIsCreating] = useState<string | null>(null);

//   const displayUsers = searchQuery ? users : allUsers;

//   const handleUserClick = async (userId: string) => {
//     setIsCreating(userId);
//     try {
//       const conversationId = await getOrCreateConversation({
//         participantId: userId,
//       });
//       router.push(`/conversations/${conversationId}`);
//       onClose();
//     } catch (error) {
//       console.error("Error creating conversation:", error);
//     } finally {
//       setIsCreating(null);
//     }
//   };

//   return (
//     <div className="p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="font-semibold text-gray-900">New Chat</h3>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Search Input */}
//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//         <Input
//           type="text"
//           placeholder="Search by name..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="pl-10"
//           autoFocus
//         />
//       </div>

//       {/* Users List */}
//       <ScrollArea className="h-64">
//         {displayUsers === undefined ? (
//           <div className="text-center text-gray-500 py-8">
//             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//             <p className="text-sm">Loading users...</p>
//           </div>
//         ) : displayUsers.length === 0 ? (
//           <div className="text-center text-gray-500 py-8">
//             <p className="text-sm">
//               {searchQuery ? "No users found" : "No other users yet"}
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-1">
//             {displayUsers.map((user) => (
//               <button
//                 key={user._id}
//                 onClick={() => handleUserClick(user.clerkId)}
//                 disabled={isCreating === user.clerkId}
//                 className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 rounded-lg transition text-left disabled:opacity-50"
//               >
//                 <div className="relative">
//                   <Avatar>
//                     <AvatarImage src={user.imageUrl} />
//                     <AvatarFallback>
//                       {user.name.substring(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <OnlineStatus isOnline={user.isOnline} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium truncate">{user.name}</p>
//                   <p className="text-sm text-gray-500 truncate">{user.email}</p>
//                 </div>
//                 {isCreating === user.clerkId && (
//                   <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </ScrollArea>
//     </div>
//   );
// }
// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useRouter } from "next/navigation";
// import { Users } from "lucide-react";
// import OnlineIndicator from "@/components/chat/TypingIndicator";

// interface Props {
//   currentUserId: string;
//   searchQuery: string;
//   onBack: () => void;
// }

// export default function UserSearch({ currentUserId, searchQuery, onBack }: Props) {
//   const router = useRouter();
//   const getOrCreate = useMutation(api.conversations.getOrCreateConversation);

//   const users = useQuery(
//     searchQuery ? api.users.searchUsers : api.users.getAllUsers,
//     searchQuery
//       ? { query: searchQuery, currentClerkId: currentUserId }
//       : { currentClerkId: currentUserId }
//   );

//   const handleUserClick = async (otherUserId: string) => {
//     const conversationId = await getOrCreate({ currentUserId, otherUserId });
//     onBack();
//     router.push(`/chat/${conversationId}`);
//   };

//   // Skeleton loader
//   if (users === undefined) {
//     return (
//       <div className="flex flex-col gap-1 p-2">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
//             <div className="w-12 h-12 rounded-full bg-[#2a3942] flex-shrink-0" />
//             <div className="flex-1">
//               <div className="h-3 bg-[#2a3942] rounded w-3/4 mb-2" />
//               <div className="h-3 bg-[#2a3942] rounded w-1/2" />
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   // Empty state
//   if (users.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center p-10 text-center mt-4">
//         <Users className="w-12 h-12 text-[#2a3942] mb-4" />
//         <p className="text-[#8696a0] text-sm font-medium">
//           {searchQuery ? "No users found" : "No other users yet"}
//         </p>
//         <p className="text-[#8696a0] text-xs mt-1">
//           Invite friends to join TarsChat!
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col">
//       <p className="px-4 py-2 text-[#8696a0] text-[11px] font-semibold uppercase tracking-widest">
//         {searchQuery ? `Results for "${searchQuery}"` : "All people"}
//       </p>
//       {users.map((user) => (
//         <button
//           key={user._id}
//           onClick={() => handleUserClick(user.clerkId)}
//           className="flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors text-left w-full"
//         >
//           <div className="relative flex-shrink-0">
//             {user.imageUrl ? (
//               <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
//             ) : (
//               <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-semibold text-lg">
//                 {user.name[0]?.toUpperCase()}
//               </div>
//             )}
//             <OnlineIndicator userId={user.clerkId} small />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-[#e9edef] font-medium text-sm">{user.name}</p>
//             <p className="text-[#8696a0] text-xs truncate">{user.email}</p>
//           </div>
//         </button>
//       ))}
//     </div>
//   );
// }
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import OnlineIndicator from "@/components/chat/TypingIndicator";

interface Props {
  currentUserId: string;
  searchQuery: string;
  onBack: () => void;
}

export default function UserSearch({ currentUserId, searchQuery, onBack }: Props) {
  const router = useRouter();
  const getOrCreate = useMutation(api.conversations.getOrCreateConversation);

  // Two separate queries — Convex can't infer union arg types when the
  // query function itself changes dynamically. Use "skip" on the inactive one.
  const allUsers = useQuery(
    api.users.getAllUsers,
    !searchQuery ? { currentClerkId: currentUserId } : "skip"
  );

  const searchedUsers = useQuery(
    api.users.searchUsers,
    searchQuery ? { query: searchQuery, currentClerkId: currentUserId } : "skip"
  );

  const users = searchQuery ? searchedUsers : allUsers;

  const handleUserClick = async (otherUserId: string) => {
    const conversationId = await getOrCreate({ currentUserId, otherUserId });
    onBack();
    router.push(`/chat/${conversationId}`);
  };

  if (users === undefined) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center mt-4">
        <Users className="w-12 h-12 text-[#2a3942] mb-4" />
        <p className="text-[#8696a0] text-sm font-medium">
          {searchQuery ? "No users found" : "No other users yet"}
        </p>
        <p className="text-[#8696a0] text-xs mt-1">
          Invite friends to join TarsChat!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="px-4 py-2 text-[#8696a0] text-[11px] font-semibold uppercase tracking-widest">
        {searchQuery ? `Results for "${searchQuery}"` : "All people"}
      </p>
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => handleUserClick(user.clerkId)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors text-left w-full"
        >
          <div className="relative flex-shrink-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#6b7c85] flex items-center justify-center text-white font-semibold text-lg">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <OnlineIndicator userId={user.clerkId} small />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#e9edef] font-medium text-sm">{user.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
