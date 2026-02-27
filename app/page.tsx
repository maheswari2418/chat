// "use client";

// import { useAuth } from "@/lib/auth-context";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { Loader2 } from "lucide-react";
// import ChatHome from "@/components/chat/chat-home";

// export default function HomePage() {
//   const { userName, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && !userName) {
//       router.push("/register");
//     }
//   }, [userName, isLoading, router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
//           <p className="text-sm text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userName) {
//     return null;
//   }

//   return <ChatHome />;
// }
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }
}