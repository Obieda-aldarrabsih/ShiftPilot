import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import { useQueryClient } from '@tanstack/react-query';
import Login from './pages/Login';
import AgentLogin from './pages/AgentLogin';
import Dashboard from './pages/Dashboard';
import AgentView from './pages/AgentView';
import { Toaster } from 'react-hot-toast';
import './styles/theme.css';

function App() {
  const { token, role } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      connectWebSocket(queryClient);
    }
    return () => {
      disconnectWebSocket();
    };
  }, [token, queryClient]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/agent-login" element={!token ? <AgentLogin /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          !token ? <Navigate to="/login" /> :
          (role === 'MANAGER' || role === 'DISPATCHER') ? <Dashboard /> :
          role === 'AGENT' ? <AgentView /> :
          <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
