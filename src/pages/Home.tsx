import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const username = localStorage.getItem('username');

  const fetchRooms = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/rooms`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleCreateRoom = async () => {
    const roomName = prompt("Nhập tên phòng (hoặc để trống):");
    if (roomName === null) return; // Cancelled

    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomName: roomName || "New Room" })
      });
      if (res.ok) {
        const room = await res.json();
        handleJoinRoom(room.roomId);
      } else {
        alert("Không thể tạo phòng");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:8080/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        navigate(`/room/${roomId}`);
      } else {
        // Backend doesn't return nice text by default for exception if not handled, but we can try
        alert("Không thể tham gia phòng hoặc phòng đã đầy.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar glass-panel">
        <div className="logo">
          <span className="logo-icon">🏢</span>
          <h1>LandVn</h1>
        </div>
        <div className="nav-links">
          <span style={{ marginRight: '1rem' }}>Xin chào, <strong>{username}</strong></span>
          <button className="btn-secondary" onClick={handleLogout}>Đăng Xuất</button>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h2 className="title">Trở Thành Trùm Bất Động Sản</h2>
          <p className="subtitle">
            Tham gia thị trường LandVn, thu thập tài sản, đầu tư dự án và thu hút các nhà đầu tư VIP.
            Phiên bản số hóa cực đỉnh dựa trên luật chơi Splendor.
          </p>
          <div className="action-buttons">
            <button className="btn-primary btn-large" onClick={handleCreateRoom}>Tạo Phòng Chơi Mới</button>
          </div>
        </div>

        <div className="showcase glass-panel" style={{ marginTop: '2rem' }}>
          <h3 className="showcase-title">Danh Sách Phòng Chơi</h3>
          {rooms.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>Hiện chưa có phòng nào. Hãy tạo phòng mới!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {rooms.map(room => (
                <div key={room.roomId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div>
                    <strong>Phòng: {room.roomId}</strong> - Trạng thái: {room.status}
                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                      Người chơi: {room.players?.length || 0}/4
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => handleJoinRoom(room.roomId)}>
                    Tham gia
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Home;
