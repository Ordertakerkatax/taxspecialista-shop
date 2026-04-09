"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "This session has expired. Your conversation is read-only."
            : "Describe your BIR situation..."
        }
        disabled={disabled || isLoading}
        rows={1}
        className="min-h-[44px] max-h-[120px] resize-none flex-1"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || isLoading || !value.trim()}
        size="icon"
        className="h-[44px] w-[44px] shrink-0 bg-teal-600 hover:bg-teal-700"
      >
        <SendHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
