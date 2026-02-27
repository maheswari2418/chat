// "use client";

// import { ClerkProvider, useAuth } from "@clerk/nextjs";
// import { ConvexProviderWithClerk } from "convex/react-clerk";
// import { ConvexProvider as ConvexClientProvider } from "convex/react";
// import { ConvexReactClient } from "convex/react";
// import { ReactNode } from "react";

// const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// export function ConvexClerkProvider({ children }: { children: ReactNode }) {
//   return (
//     <ClerkProvider
//       publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
//     >
//       <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
//         {children}
//       </ConvexProviderWithClerk>
//     </ClerkProvider>
//   );
// }

// // Also add default export
// export default ConvexClerkProvider;
"use client";

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}