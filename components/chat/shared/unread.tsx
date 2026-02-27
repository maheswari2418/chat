import { Badge } from "@/components/ui";

interface UnreadBadgeProps {
  count: number;
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}