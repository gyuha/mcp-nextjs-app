'use client';

import { ChatRoom } from "@/components/chatting/chat-room";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { useChatStore } from "@/stores/chat-store";

export default function RoomPage({ params }: { params: { channelId: string } }) {
  const { channelId } = params;
  const { activeChannel, username } = useChatStore();

  // 사용자 이름이 설정되었는지 확인
  const hasUsername = username !== '익명';

  return (
    <div className="container max-w-6xl h-[calc(100vh-2rem)] py-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/channel">
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
                className="mr-1"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              돌아가기
            </Link>
          </Button>
          {!hasUsername && (
            <span className="text-sm text-yellow-600">
              채널 페이지에서 사용자 이름을 설정하세요!
            </span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {hasUsername && <span>참여 중: <strong>{username}</strong></span>}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatRoom channelId={channelId} />
      </div>
    </div>
  );
}