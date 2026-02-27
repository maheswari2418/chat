import { formatMessageTime } from "@/lib/formattime";

interface TimestampProps {
  timestamp: number;
}

export default function Timestamp({ timestamp }: TimestampProps) {
  return (
    <span className="text-xs text-gray-500">
      {formatMessageTime(timestamp)}
    </span>
  );
}