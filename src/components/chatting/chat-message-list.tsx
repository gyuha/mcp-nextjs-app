import { useEffect, useRef } from "react";
import { ChatMessageItem } from "./chat-message-item";
import { useChatStore } from "@/stores/chat-store";

interface ChatMessageListProps {
  channelId: string;
}

export function ChatMessageList({ channelId }: ChatMessageListProps) {
  const { messages, username } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 채널의 메시지 가져오기
  const channelMessages = messages[channelId] || [];

  // 새 메시지가 추가될 때 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length]);

  if (channelMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <p>아직 메시지가 없습니다.</p>
        <p className="text-sm">채팅을 시작해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 overflow-y-auto">
      {channelMessages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          isCurrentUser={message.sender === username}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}