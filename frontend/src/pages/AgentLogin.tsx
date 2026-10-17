import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function AgentLogin() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/agent-login', { username: phone, password: pin });
      const { token, role, userId, companyId } = res.data;
      login(token, role, userId, companyId);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid PIN or phone number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'var(--brand-teal)', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
            <Navigation color="white" size={32} />
          </div>
          <h1 style={{ fontSize: '24px' }}>Agent Portal</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="+96279..."
              style={{ fontSize: '18px', padding: '14px' }}
            />
          </div>
          
          <div className="form-group">
            <label>4-Digit PIN</label>
            <input 
              type="password" 
              className="form-input"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              maxLength={4}
              placeholder="••••"
              style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center', padding: '14px' }}
            />
          </div>

          {error && <div className="error-text" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', height: '56px', fontSize: '18px' }} disabled={loading}>
            {loading ? 'Connecting...' : 'Log In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            Dispatcher Login
          </Link>
        </div>
      </div>
    </div>
  );
}
