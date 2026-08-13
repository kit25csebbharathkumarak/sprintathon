import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Activity } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'godmode') {
      localStorage.setItem('superAdmin', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left admin-theme">
        <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '32px', left: '32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(10px)', zIndex: 20 }}>
          <ArrowLeft size={16} /> Back to Portals
        </button>

        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <img src="/logo.png" alt="4D Expense Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
            <span style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>4D Admin</span>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '24px' }}>
            Platform Control Center.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '32px' }}>
            Manage tenants, configure global routing strategies, and monitor platform health across all enterprise instances.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Users size={20} color="#3b82f6" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>Tenant Management</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Control enterprise access</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Settings size={20} color="#8b5cf6" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>Global Settings</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Configure AI boundaries</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="auth-title">Super Admin Access</h2>
            <p className="auth-subtitle">Restricted to authorized personnel</p>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--status-red-bg)', border: '1px solid var(--status-red)', padding: '12px', borderRadius: '8px', color: 'var(--status-red)', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Master Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter godmode password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} /> Demo password is "godmode"
              </div>
            </div>

            <button type="submit" className="btn-primary btn-block" style={{ backgroundColor: 'var(--status-amber)', borderColor: 'var(--status-amber)' }}>
              Authenticate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
