"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

export function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Shift+Enter = nova linha
    if (e.key === "Enter" && e.shiftKey) return;

    // Enter sozinho = enviar
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-2 p-2 border rounded-3xl"
    >
      <textarea
        className="flex-1 bg-transparent outline-none text-sm resize-none p-2"
        placeholder="Enviar mensagem..."
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!text.trim()}
          className="
            p-2 rounded-full 
            bg-primary text-white 
            hover:bg-primary/80 transition 
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </form>
  );
}