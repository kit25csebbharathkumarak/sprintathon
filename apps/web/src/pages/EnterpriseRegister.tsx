import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Briefcase, Shield } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function EnterpriseRegister() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [numberOfBranches, setNumberOfBranches] = useState('');
  const [annualTurnover, setAnnualTurnover] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState('Technology');
  const [dataSensitivity, setDataSensitivity] = useState('STANDARD');
  const [expectedTxVolume, setExpectedTxVolume] = useState('');
  const [enterpriseRequirements] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    try {
      const body = { 
        companyName, email, password,
        employeeCount, numberOfBranches, annualTurnover,
        gstin, businessType, dataSensitivity, expectedTxVolume, enterpriseRequirements
      };
      
      const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));

      navigate('/enterprise/dashboard');
    } catch (err: any) {
      setAuthError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* Top Navigation */}
      <div style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--accent-electric)', display: 'grid', placeItems: 'center', fontWeight: '900', fontSize: '18px', color: 'white' }}>
            4D
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>4D Expense</span>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Portals
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ width: '100%', maxWidth: '900px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          
          <div style={{ padding: '40px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fdfdfd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 120, 212, 0.1)', color: 'var(--accent-electric)', display: 'grid', placeItems: 'center' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Enterprise Registration</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '4px 0 0 0' }}>
                  Initialize your isolated tenant environment and define your business profile.
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            {authError && (
              <div style={{ backgroundColor: 'var(--status-red-bg)', border: '1px solid var(--status-red)', padding: '12px', borderRadius: '8px', color: 'var(--status-red)', fontSize: '0.9rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* Column 1: Account Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                    <Briefcase size={18} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Account & Organization</h3>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Registered Company Name *</label>
                    <input type="text" className="form-input" placeholder="Acme Corp" required value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isLoading} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Primary Admin Email *</label>
                    <input type="email" className="form-input" placeholder="admin@company.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Admin Password *</label>
                    <input type="password" className="form-input" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax ID</label>
                    <input type="text" className="form-input" placeholder="Optional" value={gstin} onChange={e => setGstin(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Business Type</label>
                    <select className="form-input" value={businessType} onChange={e => setBusinessType(e.target.value)} disabled={isLoading}>
                      <option value="Technology">Technology & IT</option>
                      <option value="Finance">Financial Services</option>
                      <option value="Retail">Retail & E-Commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>
                </div>

                {/* Column 2: Scale & Security */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
                    <Shield size={18} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Scale & Security Profiling</h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Total Employees</label>
                      <input type="number" className="form-input" placeholder="e.g. 500" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Branches</label>
                      <input type="number" className="form-input" placeholder="e.g. 5" value={numberOfBranches} onChange={e => setNumberOfBranches(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Est. Annual Turnover (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 50000000" value={annualTurnover} onChange={e => setAnnualTurnover(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Monthly Transactions (Volume)</label>
                    <input type="number" className="form-input" placeholder="e.g. 10000" value={expectedTxVolume} onChange={e => setExpectedTxVolume(e.target.value)} disabled={isLoading} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Isolation / Sensitivity Level</label>
                    <select className="form-input" value={dataSensitivity} onChange={e => setDataSensitivity(e.target.value)} disabled={isLoading}>
                      <option value="STANDARD">Standard Tenant Isolation</option>
                      <option value="HIGH">High Sensitivity (PII / Financial Edge)</option>
                      <option value="STRICT">Strict (Requires Dedicated Database Schema)</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                      Determines how your tenant data is physically stored on our platform.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Already have a registered environment?{' '}
                  <span onClick={() => navigate('/enterprise/login')} style={{ color: 'var(--accent-electric)', cursor: 'pointer', fontWeight: 600 }}>
                    Sign in here
                  </span>
                </div>
                <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '12px 32px', fontSize: '1rem', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Creating Workspace...' : 'Initialize Secure Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
