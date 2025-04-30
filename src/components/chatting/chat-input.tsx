import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSSE } from "@/hooks/use-sse";

interface ChatInputProps {
  channelId: string;
}

export function ChatInput({ channelId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, isConnected, loading } = useSSE({ channelId });

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return;
    
    await sendMessage(message.trim());
    setMessage("");
  };

  // Enter 키로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t flex items-end gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        className="resize-none min-h-[60px]"
        disabled={!isConnected || loading}
      />
      <Button 
        onClick={handleSendMessage} 
        disabled={!message.trim() || !isConnected || loading}
        size="icon"
        className="h-[60px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        <span className="sr-only">전송</span>
      </Button>
    </div>
  );
}