import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import Home from './pages/Home';
import Room from './pages/Room';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/room/:roomId" element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
