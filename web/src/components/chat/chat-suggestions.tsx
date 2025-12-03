// /components/chat/chat-suggestions.tsx

"use client";

import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { motion, AnimatePresence } from "framer-motion";

export function ChatSuggestions({ onSelect }: { onSelect: (msg: string) => void }) {
  const suggestions = useChatSuggestions();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="flex flex-col gap-2 mt-3"
      >
        {suggestions.map((text, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(text)}
            className="
              w-full px-4 py-2 rounded-full text-sm font-medium
              bg-muted text-muted-foreground
              hover:bg-muted/60 transition
              border border-border
            "
          >
            {text}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}