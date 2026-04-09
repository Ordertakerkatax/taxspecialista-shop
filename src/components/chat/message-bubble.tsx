"use client";

import { cn } from "@/lib/utils";
import { CitationFooter } from "./citation-footer";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function renderFormattedContent(text: string, isUser: boolean): React.ReactNode {
  // Split into lines for list detection
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect numbered list block
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-1">
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInline(item, isUser)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<br key={`br-${i}`} />);
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <span key={`p-${i}`} className="block">
        {formatInline(line, isUser)}
      </span>
    );
    i++;
  }

  return elements;
}

function formatInline(text: string, isUser: boolean): React.ReactNode {
  // Parse bold (**text**) and citation markers ([1], [2])
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[(\d+)\]/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    if (match[1] !== undefined) {
      // Bold text
      parts.push(
        <strong key={match.index} className={isUser ? "font-semibold" : "font-semibold text-gray-900"}>
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      // Citation marker
      parts.push(
        <sup
          key={match.index}
          className="text-teal-600 font-semibold cursor-help"
          title={`Reference [${match[2]}]`}
        >
          [{match[2]}]
        </sup>
      );
    }

    last = regex.lastIndex;
  }

  // Remaining text
  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts;
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
        <div className="whitespace-pre-wrap break-words">
          {renderFormattedContent(bodyText, isUser)}
        </div>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />
        )}
        {citationsText && !isUser && <CitationFooter citations={citationsText} />}
      </div>
    </div>
  );
}
