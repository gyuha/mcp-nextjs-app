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
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* 채팅방 헤더 */}
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{channelId} 채널</h2>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "연결됨" : loading ? "연결 중..." : "연결 끊김"}
          </p>
        </div>
        
        {/* 연결 상태 표시기 */}
        <div className="flex items-center gap-2">
          <div 
            className={`h-3 w-3 rounded-full ${
              isConnected ? "bg-green-500" : loading ? "bg-yellow-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? "온라인" : loading ? "연결 중" : "오프라인"}
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-2 bg-red-100 text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <ChatMessageList channelId={channelId} />
      </div>

      {/* 채팅 입력 영역 */}
      <ChatInput channelId={channelId} />
    </div>
  );
}