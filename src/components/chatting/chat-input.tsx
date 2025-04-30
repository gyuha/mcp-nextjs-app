import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSSE } from "@/hooks/use-sse";

interface ChatInputProps {
  channelId: string;
}

export function ChatInput({ channelId }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, isConnected, loading } = useSSE({ channelId });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 컴포넌트가 마운트되면 텍스트 영역에 포커스
  useEffect(() => {
    if (isConnected && !loading) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 500);
    }
  }, [isConnected, loading]);

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return;
    
    await sendMessage(message.trim());
    setMessage("");
    
    // 전송 후 텍스트 영역에 다시 포커스
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Enter 키로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t flex items-end gap-2 bg-card">
      <div className={`relative flex-1 ${isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''}`}>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
          className="resize-none min-h-[60px] pr-16 transition-shadow"
          disabled={!isConnected || loading}
        />
        <div className="absolute right-2 bottom-2 text-xs text-muted-foreground pointer-events-none">
          {isConnected && <span>Shift+Enter로 줄바꿈</span>}
        </div>
      </div>
      <Button 
        onClick={handleSendMessage} 
        disabled={!message.trim() || !isConnected || loading}
        size="icon"
        className={`h-[60px] w-[60px] rounded-full transition-transform ${message.trim() ? 'scale-100 shadow-md' : 'scale-95 opacity-70'}`}
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