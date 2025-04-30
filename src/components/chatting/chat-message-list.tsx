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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 space-y-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2 opacity-25"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="font-medium">대화 시작하기</p>
        <p className="text-sm">첫 메시지를 보내서 대화를 시작해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 space-y-4">
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