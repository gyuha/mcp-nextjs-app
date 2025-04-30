import { useEffect, useState, useRef } from 'react';
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
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
      const response = await fetch(`/api/room/${channelId}`, {
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
      eventSource = new EventSource(`/api/room/${channelId}`);

      // 연결 시작 이벤트 핸들러
      eventSource.onopen = () => {
        setLoading(false);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // 연결 성공 시 재시도 카운터 초기화
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
        
        // 재연결 시도 횟수 제한
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          // 이전 타이머가 있다면 정리
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // 자동 재연결 시도 (지수 백오프 - 시간이 갈수록 대기 시간 증가)
          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (eventSource) {
              eventSource.close();
              connectSSE();
            }
          }, delay);
        } else {
          setError('서버 연결에 실패했습니다. 페이지를 새로고침하여 다시 시도해주세요.');
        }
      };
    };

    // 초기 연결 시작
    connectSSE();

    // 컴포넌트 언마운트 또는 채널 변경 시 정리
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
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