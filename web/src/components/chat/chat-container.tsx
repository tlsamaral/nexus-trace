// /components/chat/ChatContainer.tsx

"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function ChatContainer() {
  const { messages, loading, sendMessage } = useChat();

  return (
    <Card>  
      <CardHeader>
        <CardTitle>Assistente Antifraude</CardTitle>
        <CardDescription>Como posso ajudar em sua investigação hoje?</CardDescription>
      </CardHeader>

      <CardContent>
        {messages.length === 0 ? (
          <ChatSuggestions onSelect={sendMessage} />
        ) : (
          <ChatMessages messages={messages} />
        )}
        {loading && (
          <div className="size-4 rounded-full bg-primary animate-pulse" />
        )}
      </CardContent>

      <CardFooter>
        <ChatInput onSend={sendMessage} />
      </CardFooter>
    </Card>
  );
}