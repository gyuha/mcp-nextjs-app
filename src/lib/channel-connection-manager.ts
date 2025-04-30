import { NextResponse } from "next/server";

/**
 * 채널 연결 관리를 위한 싱글톤 클래스
 * 각 채널별로 연결된 클라이언트와 해당 응답 객체를 관리합니다.
 */
export class ChannelConnectionManager {
  private static instance: ChannelConnectionManager;
  private channels: Map<string, Map<string, NextResponse>> = new Map();

  private constructor() {}

  /**
   * 싱글톤 인스턴스를 반환합니다.
   */
  public static getInstance(): ChannelConnectionManager {
    if (!ChannelConnectionManager.instance) {
      ChannelConnectionManager.instance = new ChannelConnectionManager();
    }
    return ChannelConnectionManager.instance;
  }

  /**
   * 채널에 클라이언트 연결을 추가합니다.
   */
  public addConnection(channelId: string, clientId: string, res: NextResponse): void {
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, new Map());
    }
    
    const channel = this.channels.get(channelId)!;
    channel.set(clientId, res);
    
    console.log(`Client ${clientId} connected to channel ${channelId}. Total clients: ${channel.size}`);
  }

  /**
   * 채널에서 클라이언트 연결을 제거합니다.
   */
  public removeConnection(channelId: string, clientId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;
    
    const result = channel.delete(clientId);
    
    if (result) {
      console.log(`Client ${clientId} disconnected from channel ${channelId}. Remaining clients: ${channel.size}`);
      
      // 채널에 더 이상 클라이언트가 없으면 채널 제거
      if (channel.size === 0) {
        this.channels.delete(channelId);
        console.log(`Channel ${channelId} removed as it has no clients left.`);
      }
    }
    
    return result;
  }

  /**
   * 특정 채널의 모든 클라이언트에게 메시지를 전송합니다.
   */
  public async broadcastToChannel(channelId: string, message: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel || channel.size === 0) return false;
    
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(`data: ${message}\n\n`);
    
    const clients = Array.from(channel.entries());
    for (const [clientId, res] of clients) {
      try {
        const writer = (res as any).body.getWriter();
        await writer.write(encodedMessage);
        writer.releaseLock();
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId} in channel ${channelId}:`, error);
        // 에러 발생 시 연결 제거
        this.removeConnection(channelId, clientId);
      }
    }
    
    return true;
  }

  /**
   * 특정 채널의 연결된 클라이언트 수를 반환합니다.
   */
  public getChannelClientCount(channelId: string): number {
    const channel = this.channels.get(channelId);
    return channel ? channel.size : 0;
  }

  /**
   * 모든 채널의 정보를 반환합니다.
   */
  public getAllChannelsInfo(): { id: string; clientCount: number }[] {
    return Array.from(this.channels.entries()).map(([id, clients]) => ({
      id,
      clientCount: clients.size,
    }));
  }
}