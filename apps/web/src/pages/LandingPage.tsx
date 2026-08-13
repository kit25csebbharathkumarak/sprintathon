import { useNavigate } from 'react-router-dom';
import { Building2, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '12px 20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
              <img src="/logo.png" alt="4D Expense Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px' }}>
            Manage expenses effortlessly across your enterprise.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: '40px' }}>
            A premium, isolated, and highly secure platform designed for businesses of all sizes to automate and control spending.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
            <ShieldCheck size={20} /> SOC2 Compliant & Enterprise Grade Security
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-form-wrapper" style={{ maxWidth: '500px' }}>
          <h2 className="auth-title">Welcome to 4D Expense</h2>
          <p className="auth-subtitle">Select your portal to continue</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div 
              onClick={() => navigate('/enterprise/login')}
              style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-electric)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(0, 120, 212, 0.1)', color: 'var(--accent-electric)', display: 'grid', placeItems: 'center' }}>
                <Building2 size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Enterprise User</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Log in to your company workspace</p>
              </div>
              <ArrowRight size={20} color="var(--text-muted)" />
            </div>

            <div 
              onClick={() => navigate('/admin/login')}
              style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--status-amber)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-amber)', display: 'grid', placeItems: 'center' }}>
                <Crown size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>SaaS Admin</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Manage platform and tenants</p>
              </div>
              <ArrowRight size={20} color="var(--text-muted)" />
            </div>
          </div>

          <div style={{ marginTop: '48px', fontSize: '0.95rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Don't have an account yet?{' '}
            <span onClick={() => navigate('/enterprise/register')} style={{ color: 'var(--accent-electric)', cursor: 'pointer', fontWeight: 600 }}>
              Register your Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
