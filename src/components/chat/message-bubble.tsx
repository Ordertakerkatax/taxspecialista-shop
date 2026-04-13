"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { CitationFooter } from "./citation-footer";

/**
 * Strip incomplete markdown link syntax during streaming to prevent
 * flashing of raw URLs. Removes partial `[text](url` patterns that
 * haven't closed yet.
 */
function cleanStreamingMarkdown(text: string): string {
  // Remove incomplete links: "[text](url..." without closing ")"
  return text.replace(/\[[^\]]*\]\([^)]*$/g, "");
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  // Split content into body and citations on References section
  const citationSplit = content.split(/---\n\*\*References:?\*\*/);
  const bodyText = citationSplit[0];
  const citationsText = citationSplit.length > 1 ? citationSplit[1] : null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-teal-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{bodyText}</div>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-gray-900 prose-hr:my-2 [&_sup]:text-teal-600 [&_sup]:font-semibold [&_sup]:cursor-help">
            <ReactMarkdown>{isStreaming ? cleanStreamingMarkdown(bodyText) : bodyText}</ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />
        )}
        {citationsText && !isUser && <CitationFooter citations={citationsText} />}
      </div>
    </div>
  );
}
