import React from 'react';
import './PlayerBoard.css';

interface PlayerBoardProps {
  player: any;
  isCurrentPlayer: boolean;
  isActiveTurn: boolean;
}

const tokenColors: Record<string, string> = {
  VILLA: 'token-villa',
  APARTMENT: 'token-apartment',
  TOWNHOUSE: 'token-townhouse',
  RESORT: 'token-resort',
  LAND: 'token-land',
  GOLD: 'token-gold'
};

const PlayerBoard: React.FC<PlayerBoardProps> = ({ player, isCurrentPlayer, isActiveTurn }) => {
  return (
    <div className={`player-board glass-panel ${isActiveTurn ? 'active-turn' : ''} ${isCurrentPlayer ? 'current-player-board' : 'opponent-player-board'}`} style={{ border: isCurrentPlayer && !isActiveTurn ? '1px solid rgba(255,255,255,0.3)' : undefined }}>
      <div className="player-header">
        <h4>
          {player.id}
          {isCurrentPlayer && <span className="current-player-badge">(Bạn)</span>}
          {isActiveTurn && <span className="turn-indicator">Đang đi...</span>}
        </h4>
        <div className="player-points">{player.points} Điểm</div>
      </div>
      
      <div className="player-stats">
        <div className="stat-group">
          <h5>Tài sản (Tokens)</h5>
          <div className="token-row">
            {Object.entries(player.tokens || {}).map(([type, count]) => (
              <div key={type} className={`player-token ${tokenColors[type]}`}>
                {count as number}
              </div>
            ))}
          </div>
        </div>

        <div className="stat-group">
          <h5>BĐS sở hữu (Bonuses)</h5>
          <div className="bonus-row">
            {Object.entries(player.bonuses || {}).map(([type, count]) => (
              <div key={type} className={`player-bonus ${tokenColors[type]}`}>
                +{count as number}
              </div>
            ))}
          </div>
        </div>

        {player.reservedCards && player.reservedCards.length > 0 && (
          <div className="stat-group">
            <h5>Thẻ giữ ({player.reservedCards.length}/3)</h5>
            <div className="bonus-row">
              {player.reservedCards.map((card: any) => (
                <div key={card.id} className="player-bonus" style={{ background: '#444', fontSize: '0.7rem' }}>
                  Lv{card.level}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerBoard;
