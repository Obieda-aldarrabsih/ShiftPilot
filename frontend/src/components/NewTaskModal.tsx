import React, { useState } from 'react';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewTaskModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    taskType: 'Delivery',
    notes: '',
    slaDeadlineHours: '2'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Calculate SLA deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + parseInt(formData.slaDeadlineHours));

    try {
      await api.post('/tasks', {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        address: formData.address,
        taskType: formData.taskType,
        notes: formData.notes,
        slaDeadline: deadline.toISOString()
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ background: 'white', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2>Create New Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name</label>
            <input required className="form-input" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Customer Phone</label>
            <input required type="tel" className="form-input" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Address</label>
            <input required className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Task Type</label>
              <select className="form-input" value={formData.taskType} onChange={e => setFormData({...formData, taskType: e.target.value})}>
                <option>Delivery</option>
                <option>Installation</option>
                <option>Maintenance</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label>SLA (Hours)</label>
              <select className="form-input" value={formData.slaDeadlineHours} onChange={e => setFormData({...formData, slaDeadlineHours: e.target.value})}>
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="4">4 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', height: '48px' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
