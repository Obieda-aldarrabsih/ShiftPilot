
import type { Task } from '../types';
import { MapPin, Phone, CheckCircle, Truck } from 'lucide-react';

interface Props {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: string) => void;
}

export default function AgentTaskCard({ task, onUpdateStatus }: Props) {
  const getActionBtn = () => {
    switch (task.status) {
      case 'ACCEPTED':
        return (
          <button className="btn-primary agent-action-btn" onClick={() => onUpdateStatus(task.id, 'EN_ROUTE')}>
            <Truck style={{ marginRight: '8px' }} /> I'm En Route
          </button>
        );
      case 'EN_ROUTE':
        return (
          <button className="btn-primary agent-action-btn" onClick={() => onUpdateStatus(task.id, 'ARRIVED')} style={{ backgroundColor: 'var(--brand-teal)' }}>
            <MapPin style={{ marginRight: '8px' }} /> Mark Arrived
          </button>
        );
      case 'ARRIVED':
        return (
          <button className="btn-primary agent-action-btn" onClick={() => onUpdateStatus(task.id, 'COMPLETED')} style={{ backgroundColor: 'var(--status-completed)' }}>
            <CheckCircle style={{ marginRight: '8px' }} /> Complete Task
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`premium-agent-card status-border-${task.status}`}>
      <div className="card-header">
        <div className="reference-badge">#{task.referenceCode.split('-')[1]}</div>
        <span className={`status-pill pill-${task.status}`}>{task.status.replace('_', ' ')}</span>
      </div>
      
      <div className="card-body">
        <h2 className="customer-name">{task.customerName}</h2>
        
        <div className="info-row">
          <div className="icon-box">
            <MapPin size={16} />
          </div>
          <span className="info-text">{task.address}</span>
        </div>
        
        {task.customerPhone && (
          <div className="info-row">
            <div className="icon-box">
              <Phone size={16} />
            </div>
            <a href={`tel:${task.customerPhone}`} className="info-link">
              {task.customerPhone}
            </a>
          </div>
        )}

        {task.notes && (
          <div className="notes-box">
            <span className="notes-label">Notes</span>
            <p>{task.notes}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        {getActionBtn()}
      </div>
    </div>
  );
}
