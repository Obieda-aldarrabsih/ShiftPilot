
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Task } from '../types';
import { useAuthStore } from '../store/authStore';
import AgentTaskCard from '../components/AgentTaskCard';
import { LogOut, Navigation, Search } from 'lucide-react';
import { useState } from 'react';

export default function AgentView() {
  const logout = useAuthStore(state => state.logout);
  const userId = useAuthStore(state => state.userId);
  const queryClient = useQueryClient();
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['agentTasks'],
    queryFn: async () => {
      // In MVP, agent tasks could be fetched specifically, but we'll fetch all agent's tasks from the endpoint.
      // Wait, we need an endpoint for it. We'll use the existing /agents/{id}/tasks if it exists, or just filter on client for now.
      // Assuming we implement /api/v1/agents/{id}/tasks in backend.
      const res = await api.get(`/agents/${userId}/tasks`);
      return res.data;
    },
    enabled: !!userId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => {
      const res = await api.post(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['agentTasks'], (oldData: Task[] | undefined) => {
        if (!oldData) return [updatedTask];
        return oldData.map(t => t.id === updatedTask.id ? updatedTask : t);
      });
    }
  });

  const handleUpdateStatus = (taskId: string, status: string) => {
    updateStatusMutation.mutate({ taskId, status });
  };

  const activeTasks = tasks?.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED') || [];
  
  // Filter by Tab
  const filteredByTab = activeTab === 'ALL' 
    ? activeTasks 
    : activeTasks.filter(t => t.status === activeTab);

  // Filter by Search Text
  const displayedTasks = filteredByTab.filter(t => {
    const search = filterText.toLowerCase();
    return (
      (t.customerName?.toLowerCase() || '').includes(search) || 
      (t.referenceCode?.toLowerCase() || '').includes(search)
    );
  });

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'EN_ROUTE', label: 'En Route' },
    { id: 'ARRIVED', label: 'Arrived' }
  ];

  return (
    <div className="agent-layout">
      <div className="agent-top-nav">
        <div className="nav-brand">
          <div className="brand-icon">
            <Navigation size={20} strokeWidth={3} />
          </div>
          <h2>ShiftPilot</h2>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
        </button>
      </div>

      <div className="agent-hero">
        <h1>Welcome Back!</h1>
        <p>You have <strong>{activeTasks.length}</strong> active {activeTasks.length === 1 ? 'task' : 'tasks'} today.</p>
        
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', 
              color: 'white', fontSize: '16px', outline: 'none' 
            }}
          />
        </div>
      </div>

      <div className="agent-tabs-container">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`agent-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="agent-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your route...</p>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Navigation size={48} />
            </div>
            <h3>{filterText || activeTab !== 'ALL' ? 'No matches found' : "You're all caught up!"}</h3>
            <p>{filterText || activeTab !== 'ALL' ? 'Try changing your filter or tab.' : 'Take a break, we\'ll notify you when a new task arrives.'}</p>
          </div>
        ) : (
          <div className="task-list-container">
            {displayedTasks.map(task => (
              <AgentTaskCard 
                key={task.id} 
                task={task} 
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
