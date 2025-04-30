import { useEffect } from "react";
import { ChatMessageList } from "@/components/chatting/chat-message-list";
import { ChatInput } from "@/components/chatting/chat-input";
import { useChatStore } from "@/stores/chat-store";
import { useSSE } from "@/hooks/use-sse";

interface ChatRoomProps {
  channelId: string;
}

export function ChatRoom({ channelId }: ChatRoomProps) {
  const { setActiveChannel, activeChannel } = useChatStore();
  const { isConnected, error, loading } = useSSE({ channelId });

  // 채널 활성화
  useEffect(() => {
    setActiveChannel(channelId);
  }, [channelId, setActiveChannel]);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden shadow-sm bg-card">
      {/* 채팅방 헤더 */}
      <div className="p-4 border-b bg-muted/30 flex justify-end items-center gap-3">
        {/* 연결 상태 표시기 */}
        <div className="flex items-center gap-2 bg-background/80 px-3 py-1 rounded-full text-xs">
          <div 
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "bg-green-500" : loading ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <span className="text-muted-foreground font-medium">
            {isConnected ? "온라인" : loading ? "연결 중" : "오프라인"}
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-2.5 bg-red-50 text-red-700 text-sm border-b border-red-100 flex items-center justify-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        <ChatMessageList channelId={channelId} />
      </div>

      {/* 채팅 입력 영역 */}
      <ChatInput channelId={channelId} />
    </div>
  );
}