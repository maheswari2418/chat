"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui";

interface NewChatFabProps {
  onClick: () => void;
}

export default function NewChatFab({ onClick }: NewChatFabProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
      title="New Chat"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}