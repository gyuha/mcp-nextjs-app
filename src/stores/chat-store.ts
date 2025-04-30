import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 메시지 타입 정의
export interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
  type?: 'system' | 'user';
}

// 채팅 상태 인터페이스
export interface ChatState {
  // 채팅 상태
  messages: Record<string, ChatMessage[]>;
  activeChannel: string | null;
  isConnected: boolean;
  clientId: string | null;
  username: string;

  // 액션
  setActiveChannel: (channelId: string) => void;
  addMessage: (channelId: string, message: ChatMessage) => void;
  setIsConnected: (isConnected: boolean) => void;
  setClientId: (clientId: string) => void;
  setUsername: (username: string) => void;
  clearMessages: (channelId: string) => void;
}

// 채팅 스토어 생성
export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      // 초기 상태
      messages: {},
      activeChannel: null,
      isConnected: false,
      clientId: null,
      username: '익명',

      // 액션
      setActiveChannel: (channelId) => {
        set((state) => {
          // 이 채널에 대한 메시지 배열이 없으면 초기화
          if (!state.messages[channelId]) {
            return {
              activeChannel: channelId,
              messages: {
                ...state.messages,
                [channelId]: []
              }
            };
          }
          return { activeChannel: channelId };
        });
      },

      addMessage: (channelId, message) => {
        set((state) => {
          // 이 채널에 대한 기존 메시지 배열 가져오기
          const channelMessages = state.messages[channelId] || [];
          
          // 새 메시지를 배열에 추가
          return {
            messages: {
              ...state.messages,
              [channelId]: [...channelMessages, message]
            }
          };
        });
      },

      setIsConnected: (isConnected) => set({ isConnected }),
      
      setClientId: (clientId) => set({ clientId }),
      
      setUsername: (username) => set({ username }),
      
      clearMessages: (channelId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: []
          }
        }));
      },
    }),
    { name: 'chat-store' }
  )
);