// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useEffect } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";

// /**
//  * Automatically sync logged-in Clerk user → Convex DB
//  */
// export default function SyncUser() {
//   const { user, isLoaded } = useUser();
//   const syncUser = useMutation(api.users.getCurrentUser);

//   useEffect(() => {
//     if (!isLoaded || !user) return;

//     syncUser();
//   }, [user, isLoaded, syncUser]);

//   return null;
// }