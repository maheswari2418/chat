import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TarsChat",
  description: "Real-time messaging app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}