"use client";

interface CitationFooterProps {
  citations: string;
}

export function CitationFooter({ citations }: CitationFooterProps) {
  const parsed = Array.from(citations.matchAll(/\[(\d+)\]\s*(.+)/g));

  if (parsed.length === 0) return null;

  return (
    <div className="mt-3 pt-2 border-t border-gray-100">
      <div className="space-y-0.5">
        {parsed.map(([, num, text]) => (
          <p key={num} className="text-xs text-gray-500">
            <span className="font-semibold text-teal-600">[{num}]</span>{" "}
            {text.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}
