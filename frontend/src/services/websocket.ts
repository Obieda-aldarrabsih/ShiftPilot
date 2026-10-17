import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { QueryClient } from '@tanstack/react-query';
import type { Task } from '../types';

let stompClient: Client | null = null;

export const connectWebSocket = (queryClient: QueryClient) => {
  const { companyId, role, userId } = useAuthStore.getState();
  
  if (!companyId || !role) return;

  stompClient = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = () => {
    console.log('Connected to WebSocket');
    
    if (role === 'MANAGER' || role === 'DISPATCHER') {
      stompClient?.subscribe(`/topic/company/${companyId}/board`, (message) => {
        const updatedTask: Task = JSON.parse(message.body);
        
        toast.success(`Task ${updatedTask.referenceCode} updated: ${updatedTask.status}`, {
          duration: 3000,
          position: 'bottom-right'
        });
        
        queryClient.setQueryData(['tasks'], (oldData: Task[] | undefined) => {
          if (!oldData) return [updatedTask];
          const exists = oldData.some(t => t.id === updatedTask.id);
          if (exists) {
            return oldData.map(t => t.id === updatedTask.id ? updatedTask : t);
          } else {
            return [...oldData, updatedTask];
          }
        });
      });
    } else if (role === 'AGENT' && userId) {
      stompClient?.subscribe(`/topic/agent/${userId}`, (message) => {
        const updatedTask: Task = JSON.parse(message.body);
        
        toast(`Task ${updatedTask.referenceCode} updated`, {
          icon: '🔔',
          duration: 4000
        });

        queryClient.setQueryData(['agentTasks'], (oldData: Task[] | undefined) => {
          if (!oldData) return [updatedTask];
          const exists = oldData.some(t => t.id === updatedTask.id);
          if (exists) {
            return oldData.map(t => t.id === updatedTask.id ? updatedTask : t);
          } else {
            return [...oldData, updatedTask];
          }
        });
      });
    }
  };

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
  }
};
