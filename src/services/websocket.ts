import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../config';

let stompClient: Client | null = null;

export const connectWebSocket = (roomId: string, onStateUpdate: (state: any) => void) => {
    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        onConnect: () => {
            console.log('Connected to WebSocket');
            stompClient?.subscribe(`/topic/game/${roomId}`, (message) => {
                const state = JSON.parse(message.body);
                onStateUpdate(state);
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });
    stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient !== null) {
    stompClient.deactivate();
  }
};

export const takeTokens = (roomId: string, playerId: string, tokens: string[], returnedTokens: string[] = []) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/game/${roomId}/take-tokens`,
      body: JSON.stringify({ playerId, tokens, returnedTokens })
    });
  }
};

export const buyCard = (roomId: string, playerId: string, cardId: string) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/game/${roomId}/buy-card`,
      body: JSON.stringify({ playerId, cardId })
    });
  }
};
