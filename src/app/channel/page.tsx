import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useChatStore } from "@/stores/chat-store";

const PREDEFINED_CHANNELS = ["general", "random", "support", "announcements"];

export default function ChannelPage() {
  const [customChannel, setCustomChannel] = useState("");
  const [username, setUsername] = useState("");
  const setStoreUsername = useChatStore((state) => state.setUsername);
  const storeUsername = useChatStore((state) => state.username);
  
  // 사용자 이름 설정 핸들러
  const handleSetUsername = () => {
    if (username.trim()) {
      setStoreUsername(username.trim());
    }
  };
  
  return (
    <div className="container max-w-6xl py-6">
      <h1 className="text-3xl font-bold text-center mb-8">SSE 실시간 채팅</h1>
      
      {/* 사용자 이름 설정 */}
      <Card className="p-6 mb-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">사용자 이름 설정</h2>
        <div className="flex gap-2">
          <Input
            placeholder="사용자 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
          />
          <Button onClick={handleSetUsername}>설정</Button>
        </div>
        {storeUsername !== "익명" && (
          <p className="mt-2 text-sm text-muted-foreground">
            현재 사용자 이름: <span className="font-medium">{storeUsername}</span>
          </p>
        )}
      </Card>

      {/* 채널 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 미리 정의된 채널 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">공개 채널</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREDEFINED_CHANNELS.map((channel) => (
              <Button key={channel} variant="outline" asChild className="justify-start">
                <Link href={`/(room)/${channel}`}>
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
                    className="mr-2"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  {channel}
                </Link>
              </Button>
            ))}
          </div>
        </Card>

        {/* 커스텀 채널 입력 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">커스텀 채널</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="채널 이름 (3자 이상)"
                value={customChannel}
                onChange={(e) => setCustomChannel(e.target.value)}
              />
              <Button
                disabled={customChannel.length < 3}
                asChild
              >
                <Link href={customChannel.length >= 3 ? `/(room)/${customChannel}` : "#"}>
                  입장
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              원하는 채널 이름을 입력하여 새 채널을 생성하거나 기존 채널에 참여하세요.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}