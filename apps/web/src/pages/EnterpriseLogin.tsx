import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function EnterpriseLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));

      navigate('/enterprise/dashboard');
    } catch (err: any) {
      setAuthError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '32px', left: '32px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: '8px 16px', borderRadius: '8px', backdropFilter: 'blur(10px)', zIndex: 20 }}>
          <ArrowLeft size={16} /> Back to Portals
        </button>

        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '12px 20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
              <img src="/logo.png?v=3" alt="4D Expense Logo" style={{ height: '120px', width: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '24px' }}>
            Your secure corporate workspace.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: '32px' }}>
            Sign in to access your dashboard, submit expenses, and review approvals—all in one isolated, compliant environment.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
              <CheckCircle2 size={20} color="#10b981" /> 100% Data Isolation
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
              <CheckCircle2 size={20} color="#10b981" /> Real-time Policy Engine
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
              <CheckCircle2 size={20} color="#10b981" /> Automated Approvals
            </li>
          </ul>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(0, 120, 212, 0.1)', color: 'var(--accent-electric)', display: 'grid', placeItems: 'center' }}>
              <Building2 size={28} />
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="auth-title">Enterprise Login</h2>
            <p className="auth-subtitle">Sign in to your corporate account</p>
          </div>

          {authError && (
            <div style={{ backgroundColor: 'var(--status-red-bg)', border: '1px solid var(--status-red)', padding: '12px', borderRadius: '8px', color: 'var(--status-red)', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="john.doe@company.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-electric)', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
              </div>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={isLoading}
                style={{ marginTop: '8px' }}
              />
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Is your company new?{' '}
            <span onClick={() => navigate('/enterprise/register')} style={{ color: 'var(--accent-electric)', cursor: 'pointer', fontWeight: 600 }}>
              Register Profile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
