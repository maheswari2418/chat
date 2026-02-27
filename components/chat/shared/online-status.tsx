// components/chat/shared/online-status.tsx
import { cn } from "@/lib/utils";

export default function OnlineStatus({
  isOnline,
  className,
}: {
  isOnline: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
        isOnline ? "bg-green-500" : "bg-gray-400",
        className
      )}
    />
  );
}