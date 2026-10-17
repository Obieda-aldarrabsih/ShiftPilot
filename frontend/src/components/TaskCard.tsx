import type { Task } from '../types';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

interface Props {
  task: Task;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  } : undefined;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card ${task.status}`}
      onClick={() => onClick && onClick(task)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          {task.referenceCode}
        </span>
        <span className={`status-badge status-${task.status}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{task.customerName}</div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
        <MapPin size={12} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.address}</span>
      </div>
      
      {task.customerPhone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <Phone size={12} />
          <span>{task.customerPhone}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: task.atRisk ? 'var(--status-risk)' : 'var(--text-secondary)' }}>
          <Clock size={12} />
          <span>SLA: {formatTime(task.slaDeadline)}</span>
        </div>
        
        {task.assignedAgentName && (
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--brand-teal)' }}>
            {task.assignedAgentName.split(',')[0]}
          </div>
        )}
      </div>
    </div>
  );
}
