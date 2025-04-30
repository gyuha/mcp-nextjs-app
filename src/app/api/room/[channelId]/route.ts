import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ChannelConnectionManager } from "@/lib/channel-connection-manager";

/**
 * SSE(Server-Sent Events) 연결을 위한 API 라우트
 * 채널별 실시간 메시지 스트림을 제공합니다.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = (await params).channelId;
  
  // 유효하지 않은 채널 ID 체크
  if (!channelId || channelId.length < 3) {
    return NextResponse.json(
      { error: "Invalid channel ID. Must be at least 3 characters." },
      { status: 400 }
    );
  }

  try {
    // 고유한 클라이언트 ID 생성
    const clientId = uuidv4();

    // SSE 스트림을 위한 응답 생성
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // SSE 응답 헤더 설정
    const response = new NextResponse(responseStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

    // 연결 관리자에 클라이언트 연결 추가
    const connectionManager = ChannelConnectionManager.getInstance();
    connectionManager.addConnection(channelId, clientId, response);

    // 초기 연결 메시지 전송
    await writer.write(encoder.encode(`data: {"type":"connected","clientId":"${clientId}","channelId":"${channelId}"}\n\n`));

    // 시스템 메시지 전송 (채널 연결 사용자 수 정보)
    const clientCount = connectionManager.getChannelClientCount(channelId);
    if (clientCount > 1) {
      const systemMessageData = {
        id: uuidv4(),
        message: `현재 ${clientCount}명이 채팅에 참여하고 있습니다.`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        type: 'system',
      };
      
      await writer.write(encoder.encode(`data: ${JSON.stringify(systemMessageData)}\n\n`));
      
      // 다른 사용자들에게 새 사용자 입장 알림
      const joinMessageData = {
        id: uuidv4(),
        message: `새로운 사용자가 입장했습니다.`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        type: 'system',
      };
      
      await connectionManager.broadcastToChannel(channelId, JSON.stringify(joinMessageData));
    }

    // 연결 종료 시 실행할 함수 정의
    request.signal.addEventListener("abort", () => {
      try {
        console.log(`Client ${clientId} connection aborted for channel ${channelId}`);
        connectionManager.removeConnection(channelId, clientId);
        writer.close();
        
        // 다른 사용자들에게 퇴장 알림 (비동기 처리)
        const leaveMessageData = {
          id: uuidv4(),
          message: `사용자가 퇴장했습니다.`,
          sender: 'System',
          timestamp: new Date().toISOString(),
          type: 'system',
        };
        
        connectionManager.broadcastToChannel(channelId, JSON.stringify(leaveMessageData))
          .catch(err => console.error('Error sending leave message:', err));
      } catch (error) {
        console.error('Error handling abort event:', error);
      }
    });

    return response;
  } catch (error) {
    console.error('Error establishing SSE connection:', error);
    return NextResponse.json(
      { error: "Failed to establish connection. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * 특정 채널로 메시지를 전송하는 POST 핸들러
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = (await params).channelId;
  
  try {
    // 요청 본문 파싱
    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 필수 필드 검증
    if (!payload.message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!payload.sender) {
      return NextResponse.json({ error: "Sender is required" }, { status: 400 });
    }

    // XSS 방지를 위한 기본적인 sanitize (메시지 길이 제한)
    if (payload.message.length > 2000) {
      payload.message = payload.message.substring(0, 2000) + '... (내용이 잘렸습니다)';
    }

    // 메시지에 필요한 메타데이터 추가
    const messageToSend = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      id: uuidv4(),
    });

    // 채널에 메시지 브로드캐스트
    const connectionManager = ChannelConnectionManager.getInstance();
    const sent = await connectionManager.broadcastToChannel(channelId, messageToSend);

    if (!sent) {
      return NextResponse.json({ error: "No clients connected to this channel" }, { status: 404 });
    }

    return NextResponse.json({ success: true, channelId });
  } catch (error) {
    console.error('Error sending message to channel:', error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}