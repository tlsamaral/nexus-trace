"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MessageCircle } from "lucide-react";
import { ChatContainer } from "./chat-container";

export function ChatPopover() {
  return (
    <Popover>
      <PopoverTrigger className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary/80 transition">
        <MessageCircle size={22} />
      </PopoverTrigger>

      <PopoverContent
        className="p-0 border-none shadow-2xl bg-transparent w-md"
        side="top"
        align="end"
      >
        <ChatContainer />
      </PopoverContent>
    </Popover>
  );
}