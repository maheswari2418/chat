// "use client";

// import EmptyState from "@/components/chat/shared/empty";

// export default function ChatHomePage() {
//   return (
//     <div className="hidden md:flex h-full items-center justify-center bg-white">
//       <EmptyState
//         icon="💬"
//         title="Select a conversation"
//         description="Choose a conversation from the sidebar or switch to 'All Users' tab to start chatting"
//       />
//     </div>
//   );

// }
import { redirect } from "next/navigation";

export default function ConversationsPage() {
  redirect("/chat");
}
