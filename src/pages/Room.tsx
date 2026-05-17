import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectWebSocket, disconnectWebSocket, takeTokens, buyCard } from '../services/websocket';
import { API_BASE_URL } from '../config';

import GameBoard from '../components/GameBoard';
import PlayerBoard from '../components/PlayerBoard';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<any>(null);

  useEffect(() => {
    if (roomId) {
      fetch(`${API_BASE_URL}/api/game/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => setGameState(data))
        .catch(err => console.error("Failed to load initial state", err));

      connectWebSocket(roomId, (newState) => {
        setGameState(newState);
      });
    }
    return () => disconnectWebSocket();
  }, [roomId]);

  const handleTakeTokens = (tokens: string[], returnedTokens: string[]) => {
    if (!roomId) return;
    const username = localStorage.getItem('username') || 'player1';
    takeTokens(roomId, username, tokens, returnedTokens);
  };

  const handleBuyCard = (cardId: string) => {
    if (!roomId) return;
    const username = localStorage.getItem('username') || 'player1';
    buyCard(roomId, username, cardId);
  };

  const handleLeaveRoom = async () => {
    if (roomId) {
      try {
        await fetch(`${API_BASE_URL}/api/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/');
  };

  const handleStartGame = async () => {
    if (roomId) {
      try {
        await fetch(`${API_BASE_URL}/api/rooms/${roomId}/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const currentPlayer = gameState?.players?.find((p: any) => p.id === localStorage.getItem('username'));

  return (
    <div className="room-container">
      <div className="room-header">
        <button className="btn-secondary" onClick={handleLeaveRoom}>
          ⬅ Thoát
        </button>
        <h2 className="room-title">Phòng chơi: {roomId}</h2>
        {gameState?.status === 'WAITING' ? (
           <button className="btn-primary" onClick={handleStartGame}>Bắt Đầu</button>
        ) : (
           <div className="room-header-spacer"></div>
        )}
      </div>
      
      {!gameState ? (
        <div className="loading glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          Đang tải bàn chơi hoặc chờ kết nối Server...
        </div>
      ) : (
        <>
          <GameBoard 
            state={gameState} 
            currentPlayer={currentPlayer}
            onTakeTokens={handleTakeTokens} 
            onBuyCard={handleBuyCard} 
          />
          <div className="players-container glass-panel">
            <h3>Người chơi</h3>
            <div className="players-list">
              {gameState.players?.length === 0 && <p>Chưa có người chơi nào.</p>}
              {gameState.players?.map((player: any, index: number) => (
                <PlayerBoard 
                  key={player.id} 
                  player={player} 
                  isCurrentPlayer={player.id === localStorage.getItem('username')} 
                  isActiveTurn={index === gameState.currentPlayerIndex && gameState.status === 'PLAYING'}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Room;
