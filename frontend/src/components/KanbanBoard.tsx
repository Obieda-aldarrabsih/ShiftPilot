import { useState } from 'react';
import type { Task } from '../types';
import TaskCard from './TaskCard';
import { DndContext, useDroppable, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const COLUMNS = [
  { id: 'UNASSIGNED', title: 'Unassigned' },
  { id: 'ACCEPTED', title: 'Accepted' },
  { id: 'EN_ROUTE', title: 'En Route' },
  { id: 'ARRIVED', title: 'Arrived' },
  { id: 'COMPLETED', title: 'Completed' }
];

function DroppableColumn({ id, tasks, onTaskClick }: { id: string, tasks: Task[], onTaskClick: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className="kanban-column-content"
      style={{ 
        flex: 1, 
        padding: '16px', 
        overflowY: 'auto',
        background: isOver ? 'rgba(0,0,0,0.05)' : 'transparent',
        transition: 'background 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
      ))}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '20px' }}>
          Drop tasks here
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ tasks, onTaskClick }: Props) {
  const [activeMobileTab, setActiveMobileTab] = useState('UNASSIGNED');
  const queryClient = useQueryClient();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as string;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    
    toast.success(`Moved to ${newStatus}`);
    
    // Optimistic Update
    queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
      if (!old) return old;
      return old.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    });
    
    api.post(`/tasks/${taskId}/status`, { status: newStatus }).catch(() => {
      toast.error('Failed to update task status');
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Revert on failure
    });
  };
  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="kanban-wrapper">
        <div className="kanban-mobile-tabs mobile-only">
        {COLUMNS.map(col => (
          <button 
            key={col.id} 
            className={`mobile-tab-btn ${activeMobileTab === col.id ? 'active' : ''}`}
            onClick={() => setActiveMobileTab(col.id)}
          >
            {col.title} <span className="tab-count">{getTasksByStatus(col.id).length}</span>
          </button>
        ))}
      </div>
      
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const columnTasks = getTasksByStatus(col.id);
          
          return (
            <div key={col.id} className={`kanban-column ${activeMobileTab === col.id ? 'active-mobile' : ''}`}>
              <div className="column-header">
                <span>{col.title}</span>
                <span style={{ background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {columnTasks.length}
                </span>
              </div>
              
              <DroppableColumn id={col.id} tasks={columnTasks} onTaskClick={onTaskClick} />
            </div>
          );
        })}
      </div>
      </div>
    </DndContext>
  );
}
