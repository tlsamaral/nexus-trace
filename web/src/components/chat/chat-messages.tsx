import { ChatMessage } from "@/hooks/use-chat";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatRef.current?.scroll({ top: chatRef.current.scrollHeight });
  }, [messages]);
  return (
    <div className="flex flex-col gap-3 px-1 py-2 max-h-[400px] overflow-y-auto" ref={chatRef}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`text-sm px-4 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap ${
            msg.role === "user"
              ? "bg-primary/80 text-white self-end"
              : "bg-muted self-start"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}