import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Task } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import NewTaskModal from '../components/NewTaskModal';
import AnalyticsView from './AnalyticsView';
import MapView from './MapView';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Activity, LogOut, Plus, Search, Menu, X, BarChart2, Map, Moon, Sun } from 'lucide-react';

export default function Dashboard() {
  const logout = useAuthStore(state => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [currentView, setCurrentView] = useState<'BOARD' | 'ANALYTICS' | 'MAP'>('BOARD');

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data;
    }
  });

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <div className="sidebar desktop-only">
        <div className="brand-container">
          <div className="brand-logo-bg">
            <Activity color="white" size={24} />
          </div>
          <h2 className="brand-title">ShiftPilot</h2>
        </div>
        
        <div className="nav-items">
          <div className={`nav-item ${currentView === 'BOARD' ? 'active' : ''}`} onClick={() => setCurrentView('BOARD')}>
            <Activity size={20} className="nav-icon" />
            <span className="sidebar-text">Dispatch Board</span>
          </div>
          <div className={`nav-item ${currentView === 'ANALYTICS' ? 'active' : ''}`} onClick={() => setCurrentView('ANALYTICS')}>
            <BarChart2 size={20} className="nav-icon" />
            <span className="sidebar-text">Analytics</span>
          </div>
          <div className={`nav-item ${currentView === 'MAP' ? 'active' : ''}`} onClick={() => setCurrentView('MAP')}>
            <Map size={20} className="nav-icon" />
            <span className="sidebar-text">Live Map</span>
          </div>
        </div>

        <div className="nav-items logout-container">
          <button onClick={logout} className="logout-button">
            <LogOut size={20} />
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Desktop Topbar */}
        <div className="topbar desktop-only">
          <div className="topbar-left">
            <h2>Live Operations</h2>
            <div className="search-container">
              <Search size={16} color="var(--text-secondary)" className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="form-input search-input" 
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button className="btn-primary new-task-btn" onClick={() => setIsNewTaskModalOpen(true)}>
              <Plus size={18} />
              New Task
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo-bg" style={{ padding: '6px' }}>
              <Activity color="white" size={20} />
            </div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: 'var(--primary-bg)' }}>ShiftPilot</h2>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-dropdown mobile-only">
            <button className="mobile-menu-item" onClick={() => { setCurrentView('ANALYTICS'); setIsMobileMenuOpen(false); }}>
              <BarChart2 size={18} /> Analytics
            </button>
            <button className="mobile-menu-item" onClick={() => { setCurrentView('MAP'); setIsMobileMenuOpen(false); }}>
              <Map size={18} /> Live Map
            </button>
            <button className="mobile-menu-item" onClick={() => { setIsNewTaskModalOpen(true); setIsMobileMenuOpen(false); }}>
              <Plus size={18} /> New Task
            </button>
            <button className="mobile-menu-item logout" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}

        {/* Mobile Search */}
        <div className="mobile-search-bar mobile-only">
          <Search size={16} color="var(--text-secondary)" className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks by name or code..." 
            className="form-input search-input" 
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
        
        {currentView === 'ANALYTICS' && <AnalyticsView />}

        {currentView === 'MAP' && (
          <MapView tasks={tasks || []} />
        )}

        {currentView === 'BOARD' && (
          isLoading ? (
            <div style={{ padding: '24px', flex: 1 }}>Loading tasks...</div>
          ) : (
            <KanbanBoard 
              tasks={(tasks || []).filter(t => {
                const search = filterText.toLowerCase();
                return (
                  (t.customerName?.toLowerCase() || '').includes(search) || 
                  (t.referenceCode?.toLowerCase() || '').includes(search) ||
                  (t.assignedAgentName?.toLowerCase() || '').includes(search)
                );
              })} 
              onTaskClick={(t) => setSelectedTask(t)} 
            />
          )
        )}
        
        {/* Mobile Footer */}
        <div className="mobile-footer mobile-only">
          <p>© 2026 ShiftPilot Dispatch. All rights reserved.</p>
        </div>
      </div>

      {selectedTask && (
        <div className="task-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '24px' }}>Task Details</h3>
            <button onClick={() => setSelectedTask(null)} style={{ background: 'var(--secondary-bg)', border: 'none', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>&times;</button>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '16px' }}>
              <span className={`status-badge status-${selectedTask.status}`}>{selectedTask.status.replace('_', ' ')}</span>
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{selectedTask.customerName}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px', lineHeight: '1.5' }}>{selectedTask.address}</p>
            
            <div style={{ background: 'var(--secondary-bg)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Type:</strong> 
                <span style={{ fontWeight: '600' }}>{selectedTask.taskType}</span>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Phone:</strong> 
                <a href={`tel:${selectedTask.customerPhone}`} style={{ color: 'var(--brand-teal)', fontWeight: '600', textDecoration: 'none' }}>{selectedTask.customerPhone}</a>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Notes:</strong> 
                <p style={{ margin: 0, lineHeight: '1.5' }}>{selectedTask.notes || 'No specific notes.'}</p>
              </div>
            </div>

            {selectedTask.assignedAgentName && (
              <div style={{ border: '2px solid rgba(23, 176, 167, 0.1)', padding: '20px', borderRadius: '16px', background: 'rgba(23, 176, 167, 0.02)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--brand-teal)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Agent</h4>
                <div style={{ fontWeight: '700', fontSize: '18px' }}>{selectedTask.assignedAgentName}</div>
              </div>
            )}
          </div>
          
          {selectedTask.status === 'UNASSIGNED' && (
            <button 
              className="btn-primary" 
              style={{ padding: '16px', fontSize: '16px', marginTop: '24px', height: '56px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(232, 93, 42, 0.2)' }} 
              onClick={async () => {
                try {
                  await api.post(`/tasks/${selectedTask.id}/auto-assign`);
                  setSelectedTask(null);
                } catch (err) {
                  alert('Auto-assign failed or no eligible agent found.');
                }
              }}
            >
              Auto Assign Least Loaded Agent
            </button>
          )}
        </div>
      )}
      {isNewTaskModalOpen && (
        <NewTaskModal 
          onClose={() => setIsNewTaskModalOpen(false)} 
          onSuccess={() => { /* Real-time will auto-update the board */ }}
        />
      )}
    </div>
  );
}
