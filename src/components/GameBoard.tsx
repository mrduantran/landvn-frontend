import React from 'react';
import './GameBoard.css';

interface GameBoardProps {
  state: any;
  currentPlayer: any;
  onTakeTokens: (tokens: string[], returnedTokens: string[]) => void;
  onBuyCard: (cardId: string) => void;
  onReserveCard: (cardId: string, returnedTokens: string[]) => void;
}

const tokenColors: Record<string, string> = {
  VILLA: 'token-villa',
  APARTMENT: 'token-apartment',
  TOWNHOUSE: 'token-townhouse',
  RESORT: 'token-resort',
  LAND: 'token-land',
  GOLD: 'token-gold'
};

const tokenLabels: Record<string, string> = {
  VILLA: 'Biệt Thự',
  APARTMENT: 'Căn Hộ',
  TOWNHOUSE: 'Nhà Phố',
  RESORT: 'Nghỉ Dưỡng',
  LAND: 'Đất Nền',
  GOLD: 'Vàng'
};

const GameBoard: React.FC<GameBoardProps> = ({ state, currentPlayer, onTakeTokens, onBuyCard, onReserveCard }) => {
  const [selectedTokens, setSelectedTokens] = React.useState<string[]>([]);
  const [returnedTokens, setReturnedTokens] = React.useState<string[]>([]);
  const [selectedReserveCard, setSelectedReserveCard] = React.useState<string | null>(null);

  if (!state) return null;

  const currentTotalTokens = currentPlayer?.tokens ? Object.values(currentPlayer.tokens).reduce((a: any, b: any) => a + b, 0) as number : 0;
  const futureTotalTokens = currentTotalTokens + selectedTokens.length;
  const excessTokens = futureTotalTokens > 10 ? futureTotalTokens - 10 : 0;

  const handleTokenClick = (type: string) => {
    if (type === 'GOLD') {
      alert("Bạn không thể lấy Vàng trực tiếp! Vàng chỉ được lấy khi bạn Úp/Giữ (Reserve) thẻ.");
      return;
    }

    if (state.bankTokens[type] === 0) {
      alert(`Token ${tokenLabels[type]} trên bàn đã hết!`);
      return;
    }

    if (selectedTokens.length >= 3) return;

    if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) {
      return; 
    }

    if (selectedTokens.includes(type)) {
      if (selectedTokens.length === 1) {
        if (state.bankTokens[type] >= 4) {
          setSelectedTokens([...selectedTokens, type]);
        } else {
          alert(`Không thể lấy 2 Token ${tokenLabels[type]} cùng lúc vì số lượng trên bàn đang dưới 4 cục!`);
        }
      }
    } else {
      if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) {
        return;
      }
      setSelectedTokens([...selectedTokens, type]);
    }
  };

  const handleReturnTokenClick = (type: string) => {
    if (returnedTokens.length < excessTokens) {
      setReturnedTokens([...returnedTokens, type]);
    }
  };

  const handleCancelReturn = (index: number) => {
    const newArr = [...returnedTokens];
    newArr.splice(index, 1);
    setReturnedTokens(newArr);
  };

  const handleConfirmTokens = () => {
    if (excessTokens > 0 && returnedTokens.length < excessTokens) {
      alert(`Bạn phải chọn đủ ${excessTokens} token để trả lại trước khi xác nhận!`);
      return;
    }

    if (selectedTokens.length === 2 && selectedTokens[0] === selectedTokens[1]) {
      onTakeTokens(selectedTokens, returnedTokens);
      setSelectedTokens([]);
      setReturnedTokens([]);
    } else if (selectedTokens.length > 0 && selectedTokens.length <= 3) {
      onTakeTokens(selectedTokens, returnedTokens);
      setSelectedTokens([]);
      setReturnedTokens([]);
    } else {
      alert("Bạn phải chọn 1 đến 3 thẻ khác màu, hoặc 2 thẻ cùng màu!");
    }
  };

  const handleCancelAll = () => {
    setSelectedTokens([]);
    setReturnedTokens([]);
    setSelectedReserveCard(null);
  };

  const handleReserveClick = (cardId: string) => {
    if (currentTotalTokens >= 10 && state.bankTokens['GOLD'] > 0) {
       setSelectedReserveCard(cardId);
       setReturnedTokens([]);
    } else {
       onReserveCard(cardId, []);
    }
  };

  const handleConfirmReserve = () => {
    if (returnedTokens.length < 1) {
       alert("Bạn phải chọn 1 token để trả lại!");
       return;
    }
    if (selectedReserveCard) {
       onReserveCard(selectedReserveCard, returnedTokens);
       setSelectedReserveCard(null);
       setReturnedTokens([]);
    }
  };

  return (
    <div className="game-board glass-panel">
      <div className="nobles-row">
        {state.tableNobles?.map((noble: any) => (
          <div key={noble.id} className="card noble-card">
            <h4>VIP</h4>
            <div className="points">{noble.points}</div>
            <div className="cost-req">
              {Object.entries(noble.requirements || {}).map(([type, amount]) => (
                 <span key={type} className={`req-badge ${tokenColors[type]}`}>{amount as number}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cards-area">
        {currentPlayer?.reservedCards && currentPlayer.reservedCards.length > 0 && (
          <div className="card-row" style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <div className="level-label" style={{ color: 'gold', fontSize: '1rem' }}>Giữ</div>
            {currentPlayer.reservedCards.map((card: any) => <ProjectCard key={card.id} card={card} onBuy={onBuyCard} />)}
          </div>
        )}
        <div className="card-row">
          <div className="level-label">Lv3</div>
          {state.tableLevel3?.map((card: any) => <ProjectCard key={card.id} card={card} onBuy={onBuyCard} onReserve={handleReserveClick} />)}
        </div>
        <div className="card-row">
          <div className="level-label">Lv2</div>
          {state.tableLevel2?.map((card: any) => <ProjectCard key={card.id} card={card} onBuy={onBuyCard} onReserve={handleReserveClick} />)}
        </div>
        <div className="card-row">
          <div className="level-label">Lv1</div>
          {state.tableLevel1?.map((card: any) => <ProjectCard key={card.id} card={card} onBuy={onBuyCard} onReserve={handleReserveClick} />)}
        </div>
      </div>

      <div className="bank-tokens" style={{ position: 'relative', marginBottom: selectedTokens.length > 0 ? (excessTokens > 0 ? '150px' : '40px') : '0' }}>
        {Object.entries(state.bankTokens || {}).map(([type, count]) => (
          <div key={type} className="token-stack" onClick={() => handleTokenClick(type)} style={{ cursor: 'pointer' }}>
            <div className={`token ${tokenColors[type]}`}>{tokenLabels[type]}</div>
            <div className="token-count">{count as number}</div>
          </div>
        ))}
        {selectedTokens.length > 0 && (
          <div style={{ position: 'absolute', bottom: excessTokens > 0 ? '-140px' : '-45px', left: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span>Đang chọn: </span>
              {selectedTokens.map((t, idx) => (
                 <div key={idx} className={`token ${tokenColors[t]}`} style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}></div>
              ))}
              <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleConfirmTokens}>Lấy Token</button>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={handleCancelAll}>Hủy</button>
            </div>

            {excessTokens > 0 && (
              <div style={{ padding: '10px', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '8px', width: '100%' }}>
                <p style={{ color: 'white', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                  Cảnh báo: Bạn sẽ bị lố <b>{excessTokens}</b> token (giới hạn 10). Vui lòng chọn token trong túi của bạn để trả lại:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem' }}>Kho của bạn:</span>
                  {currentPlayer?.tokens && Object.entries(currentPlayer.tokens).map(([type, count]) => {
                    const returningCount = returnedTokens.filter(t => t === type).length;
                    const availableToReturn = (count as number) - returningCount;
                    if (availableToReturn > 0) {
                      return (
                        <div key={type} className={`token ${tokenColors[type]}`} style={{ cursor: 'pointer', width: '30px', height: '30px', fontSize: '0.8rem', opacity: returnedTokens.length >= excessTokens ? 0.5 : 1 }} onClick={() => handleReturnTokenClick(type)}>
                          {availableToReturn}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem' }}>Sẽ trả lại:</span>
                  {returnedTokens.map((t, idx) => (
                     <div key={idx} className={`token ${tokenColors[t]}`} style={{ width: '30px', height: '30px', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleCancelReturn(idx)}></div>
                  ))}
                  {returnedTokens.length === 0 && <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Chưa chọn</span>}
                </div>
              </div>
            )}
            
          </div>
        )}
        
        {selectedReserveCard && (
          <div style={{ position: 'absolute', bottom: '-140px', left: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ padding: '10px', background: 'rgba(255,215,0,0.1)', border: '1px solid gold', borderRadius: '8px', width: '100%' }}>
                <p style={{ color: 'white', margin: '0 0 10px 0', fontSize: '0.9rem' }}>
                  Bạn đang có 10 token. Khi Giữ thẻ này, bạn nhận được 1 Vàng. Bạn phải trả lại 1 token:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem' }}>Kho của bạn:</span>
                  {currentPlayer?.tokens && Object.entries(currentPlayer.tokens).map(([type, count]) => {
                    const returningCount = returnedTokens.filter(t => t === type).length;
                    const availableToReturn = (count as number) - returningCount;
                    if (availableToReturn > 0) {
                      return (
                        <div key={type} className={`token ${tokenColors[type]}`} style={{ cursor: 'pointer', width: '30px', height: '30px', fontSize: '0.8rem', opacity: returnedTokens.length >= 1 ? 0.5 : 1 }} onClick={() => returnedTokens.length < 1 && setReturnedTokens([...returnedTokens, type])}>
                          {availableToReturn}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem' }}>Sẽ trả lại:</span>
                  {returnedTokens.map((t, idx) => (
                     <div key={idx} className={`token ${tokenColors[t]}`} style={{ width: '30px', height: '30px', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleCancelReturn(idx)}></div>
                  ))}
                  {returnedTokens.length === 0 && <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Chưa chọn</span>}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleConfirmReserve}>Xác nhận Giữ thẻ</button>
                  <button className="btn-secondary" onClick={handleCancelAll}>Hủy</button>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCard = ({ card, onBuy, onReserve }: { card: any, onBuy: (id: string) => void, onReserve?: (id: string) => void }) => {
  return (
    <div className="card project-card">
      <div className="card-header">
         <span className="card-points">{card.points > 0 ? card.points : ''}</span>
         <span className={`card-bonus ${tokenColors[card.bonus]}`}></span>
      </div>
      <div className="card-body">Dự án BĐS</div>
      <div className="card-cost">
        {Object.entries(card.cost || {}).map(([type, amount]) => (
          <div key={type} className={`cost-token ${tokenColors[type]}`}>{amount as number}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          <button className="btn-primary" style={{flex: 1, padding: '4px', fontSize: '0.8rem', minWidth: 0}} onClick={(e) => { e.stopPropagation(); onBuy(card.id); }}>Mua</button>
          {onReserve && (
              <button className="btn-secondary" style={{flex: 1, padding: '4px', fontSize: '0.8rem', minWidth: 0}} onClick={(e) => { e.stopPropagation(); onReserve(card.id); }}>Giữ</button>
          )}
      </div>
    </div>
  );
};

export default GameBoard;
