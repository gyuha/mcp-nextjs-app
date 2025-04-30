'use client';

import { ChatRoom } from "@/components/chatting/chat-room";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { use } from "react";
import { useChatStore } from "@/stores/chat-store";

export default function RoomPage({ params }: { params: { channelId: string } }) {
  // React.use()를 사용하여 params 비동기 객체 언래핑
  const unwrappedParams = use(params);
  const channelId = unwrappedParams.channelId;
  const { username } = useChatStore();

  // 사용자 이름이 설정되었는지 확인
  const hasUsername = username !== '익명';

  return (
    <div className="container max-w-6xl h-[calc(100vh-2rem)] py-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 bg-card rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="shrink-0">
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
          <div>
            <h1 className="text-lg font-bold">{channelId} 채널</h1>
            {!hasUsername && (
              <span className="text-sm text-yellow-600">
                채널 페이지에서 사용자 이름을 설정하세요!
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full text-sm">
          {hasUsername ? (
            <>
              <div className="size-2.5 rounded-full bg-green-500"></div>
              <span>참여 중: <strong>{username}</strong></span>
            </>
          ) : (
            <>
              <div className="size-2.5 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">익명으로 참여 중</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatRoom channelId={channelId} />
      </div>
    </div>
  );
}