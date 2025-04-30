import { useEffect, useState } from 'react';
import { useChatStore, ChatMessage } from '@/stores/chat-store';

interface UseSSEProps {
  channelId: string;
  enabled?: boolean;
}

/**
 * SSE(Server-Sent Events) 연결을 관리하는 훅
 * 특정 채널에 연결하고 메시지를 수신합니다.
 */
export function useSSE({ channelId, enabled = true }: UseSSEProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 채팅 스토어에서 필요한 상태와 액션 가져오기
  const {
    addMessage,
    setIsConnected,
    setClientId,
    clientId,
    username,
    isConnected
  } = useChatStore();

  // 메시지 보내기 함수
  const sendMessage = async (message: string) => {
    if (!channelId || !isConnected) {
      setError('채널에 연결되어 있지 않습니다.');
      return;
    }

    try {
      const response = await fetch(`/api/sse/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sender: username,
          type: 'user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '메시지 전송 실패');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '메시지 전송 중 오류 발생');
      console.error('Error sending message:', err);
    }
  };

  // SSE 연결 설정 및 이벤트 수신
  useEffect(() => {
    // enabled가 false면 연결하지 않음
    if (!enabled || !channelId) return;

    let eventSource: EventSource | null = null;
    
    const connectSSE = () => {
      setLoading(true);
      setError(null);

      // 기존 연결 정리
      if (eventSource) {
        eventSource.close();
      }

      // 새 SSE 연결 생성
      eventSource = new EventSource(`/api/sse/${channelId}`);

      // 연결 시작 이벤트 핸들러
      eventSource.onopen = () => {
        setLoading(false);
        setIsConnected(true);
      };

      // 메시지 수신 이벤트 핸들러
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // 연결 완료 메시지 처리
          if (data.type === 'connected') {
            setClientId(data.clientId);
            
            // 시스템 메시지로 입장 알림 추가
            const systemMessage: ChatMessage = {
              id: crypto.randomUUID(),
              message: '채팅방에 연결되었습니다.',
              sender: 'System',
              timestamp: new Date().toISOString(),
              type: 'system',
            };
            
            addMessage(channelId, systemMessage);
            return;
          }
          
          // 일반 메시지 처리
          addMessage(channelId, data as ChatMessage);
        } catch (err) {
          console.error('Error parsing message:', err, event.data);
        }
      };

      // 에러 처리
      eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        setError('서버 연결 오류. 다시 연결 중...');
        setIsConnected(false);
        setLoading(false);
        
        // 자동 재연결 시도 (3초 후)
        setTimeout(() => {
          if (eventSource) {
            eventSource.close();
            connectSSE();
          }
        }, 3000);
      };
    };

    // 초기 연결 시작
    connectSSE();

    // 컴포넌트 언마운트 또는 채널 변경 시 정리
    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [channelId, enabled, addMessage, setIsConnected, setClientId]);

  return {
    isConnected,
    error,
    loading,
    sendMessage,
    clientId,
  };
}