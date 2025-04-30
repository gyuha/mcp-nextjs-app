import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/stores/chat-store";
import { format } from "date-fns";
import DOMPurify from "dompurify";

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function ChatMessageItem({ message, isCurrentUser }: MessageProps) {
  // 메시지 타임스탬프 포맷팅
  const formattedTime = format(new Date(message.timestamp), "HH:mm");
  
  // 안전한 HTML 렌더링 (줄바꿈 등 지원)
  const sanitizedMessage = DOMPurify.sanitize(message.message.replace(/\n/g, "<br />"));

  // 시스템 메시지 렌더링
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full mb-4 items-end",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {message.sender.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[80%]", isCurrentUser ? "items-end" : "items-start")}>
        {!isCurrentUser && (
          <span className="text-xs text-muted-foreground mb-1">{message.sender}</span>
        )}

        <Card
          className={cn(
            "px-3 py-2 break-words",
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted rounded-tl-none"
          )}
        >
          <div dangerouslySetInnerHTML={{ __html: sanitizedMessage }} />
        </Card>

        <span className="text-xs text-muted-foreground mt-1">{formattedTime}</span>
      </div>

      {isCurrentUser && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {message.sender.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}