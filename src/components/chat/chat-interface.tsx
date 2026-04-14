"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Badge } from "@/components/ui/badge";

interface InitialMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  sessionToken: string;
  sessionId: string;
  tier: "basic" | "comprehensive";
  expiresAt?: string; // ISO string — only passed for active sessions
  initialMessages: InitialMessage[];
  readOnly: boolean;
}

function useCountdown(expiresAt?: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">("normal");

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setUrgency("critical");
        return;
      }
      const hrs = Math.floor(diff / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(`${hrs}h ${mins}m`);
      setUrgency(hrs < 1 ? "critical" : hrs < 4 ? "warning" : "normal");
    }

    tick();
    const id = setInterval(tick, 60_000); // update every minute
    return () => clearInterval(id);
  }, [expiresAt]);

  return { timeLeft, urgency };
}

export function ChatInterface({
  sessionToken,
  sessionId: _sessionId,
  tier,
  expiresAt,
  initialMessages,
  readOnly,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { timeLeft, urgency } = useCountdown(expiresAt);

  // Convert DB messages to UIMessage format for v6 SDK
  const initialUIMessages = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { sessionToken } }),
    [sessionToken]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialUIMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Count only user messages — AI responses don't consume credits
  const maxMessages = tier === "comprehensive" ? 100 : 50;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const limitReached = userMessageCount >= maxMessages ||
    (error && "message" in error && /limit/i.test(error.message));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onSubmit = () => {
    if (input.trim() && !readOnly && !isLoading && !limitReached) {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-[768px] mx-auto bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              TaxSpecialista Consult
            </h1>
            <Badge variant="outline" className="text-xs">
              {tier === "comprehensive" ? "Comprehensive" : "Basic"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && timeLeft && (
              <div className={`flex items-center gap-1.5 text-xs ${
                urgency === "critical" ? "text-red-600" :
                urgency === "warning" ? "text-amber-600" :
                "text-gray-500"
              }`}>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Session expires in: <strong>{timeLeft}</strong></span>
              </div>
            )}
            {readOnly && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                Read Only
              </Badge>
            )}
          </div>
        </div>
        {/* Credit usage bar — counts user messages only */}
        {!readOnly && (() => {
          const remaining = Math.max(0, maxMessages - userMessageCount);
          const pct = Math.min(100, (userMessageCount / maxMessages) * 100);
          // Color transitions: teal (0-60%) → amber (60-85%) → red (85-100%)
          const barColor =
            pct <= 60 ? "bg-teal-500" :
            pct <= 85 ? "bg-amber-500" :
            "bg-red-500";
          const textColor =
            pct <= 60 ? "text-teal-600" :
            pct <= 85 ? "text-amber-600" :
            "text-red-600";
          const label =
            remaining === 0 ? "No messages remaining" :
            `${remaining} message${remaining === 1 ? "" : "s"} remaining`;
          return (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-medium ${textColor}`}>
                  {label}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((message, i) => {
          // Concatenate ALL text parts (multi-step tool responses have multiple text parts)
          const textParts = message.parts.filter((p) => p.type === "text");
          const content = textParts
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("\n\n");
          const isStreamingThis =
            isLoading &&
            i === messages.length - 1 &&
            message.role === "assistant";

          return (
            <MessageBubble
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={content}
              isStreaming={isStreamingThis}
            />
          );
        })}

        {/* Typing indicator: shown when AI is starting to respond (last message is user) */}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

        {error && !limitReached && (
          <div className="text-center">
            <div className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 inline-block max-w-md">
              <p className="text-amber-800 font-medium">We&apos;re experiencing a temporary service issue</p>
              <p className="text-amber-700 mt-1">
                Our AI advisory service is temporarily unavailable. Your session and any previous messages are saved.
                Please wait a moment and try sending your message again.
              </p>
              <p className="text-amber-600 text-xs mt-2">
                If this persists, please contact us at support@taxspecialista.com
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input, limit-reached banner, or read-only banner */}
      {limitReached && !readOnly ? (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-800 font-medium text-center">
            You&apos;ve used all {maxMessages} messages for this consultation.
          </p>
          <p className="text-xs text-red-600 text-center mt-1">
            Your conversation is saved and you can still scroll through your advisory above.
            {tier === "basic" && (
              <> For more in-depth consultations, consider our{" "}
                <a href="/" className="text-teal-600 underline font-medium">Comprehensive plan</a> with up to 100 messages.
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 text-center mt-1.5">
            Need professional assistance?{" "}
            <a href="https://taxspecialista.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">
              ETM Tax Agent Office
            </a>
          </p>
        </div>
      ) : !readOnly ? (
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
          isLoading={isLoading}
          disabled={false}
        />
      ) : (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 text-center">
          <p className="text-sm text-amber-800">
            This session has expired. Your conversation history is read-only.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-1 bg-white border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">Powered by TaxSpecialista</p>
      </div>
    </div>
  );
}
