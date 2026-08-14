import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, Users, Shield, Building2, 
  BrainCircuit, FileSearch, Settings, LogOut, Network,
  FileText, BarChart, PieChart
} from 'lucide-react';

import ExecutiveDashboard from '../components/ExecutiveDashboard';
import ExpenseManagement from '../components/ExpenseManagement';
import EmployeeManagement from '../components/EmployeeManagement';
import PolicyEngine from '../components/PolicyEngine';
import VendorManagement from '../components/VendorManagement';
import { API_BASE } from '../lib/api';

interface Expense {
  id: string;
  vendor: string;
  amount: number;
  category: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'FLAGGED';
  eventHash: string;
  prevEventHash: string;
  anomalyScore: number;
}

interface Tenant {
  id: string;
  name: string;
  routingStrategy?: string;
  routingReason?: string;
  dataSensitivity?: string;
}

export default function Workspace() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'reports' | 'analytics' | 'budgets' | 'employees' | 'policies' | 'vendors' | 'copilot' | 'audit' | 'tenancy'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! Ask me anything about your team\'s spending.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [verifyResult, setVerifyResult] = useState<{ isValid: boolean; tamperedIds: string[]; totalChecked: number } | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedTenant = localStorage.getItem('tenant');
    if (!storedToken || !storedTenant) {
      navigate('/enterprise/login');
      return;
    }
    setToken(storedToken);
    try {
      setActiveTenant(JSON.parse(storedTenant));
      fetchExpenses(storedToken);
    } catch {}
  }, [navigate]);

  const fetchExpenses = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/expenses`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (res.ok) {
        setExpenses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setActiveTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tenant');
    setExpenses([]);
    navigate('/');
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !token) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/expenses/copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Sorry, the AI service is currently unreachable." }]);
    }
  };

  const handleVerifyLedger = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/expenses/verify-ledger`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVerifyResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setVerifying(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, 
    { id: 'expenses', label: 'Expenses', icon: CreditCard }, 
    { id: 'reports', label: 'Reports', icon: FileText }, 
    { id: 'analytics', label: 'Analytics', icon: BarChart }, 
    { id: 'budgets', label: 'Budgets', icon: PieChart }, 
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'copilot', label: 'AI Copilot', icon: BrainCircuit }, 
    { id: 'audit', label: 'Audit Log', icon: FileSearch },
    { id: 'tenancy', label: 'Tenancy Routing', icon: Network }
  ];

  if (!token || !activeTenant) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', backgroundColor: 'var(--bg-sidebar)', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
            <img src="/logo.png?v=3" alt="4D Expense Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Workspace: {activeTenant?.name}</span>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                style={{ 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px', 
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent', 
                  color: isActive ? 'white' : '#94a3b8', 
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent', 
                  borderRadius: '8px',
                  fontWeight: isActive ? 600 : 500, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  marginBottom: '4px',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--status-green)', borderRadius: '20px', marginBottom: '16px', justifyContent: 'center' }}>
            <span className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-green)', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--status-green)', fontWeight: 600 }}>Triple-Layer Isolated</span>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.2)' }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header/Nav */}
        <header style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
           <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
             {navItems.find(i => i.id === activeTab)?.label}
           </h2>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={18} color="var(--text-secondary)" />
              </div>
           </div>
        </header>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {/* Dynamic Tab Rendering */}
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'expenses' && <ExpenseManagement />}
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'policies' && <PolicyEngine />}
          {activeTab === 'vendors' && <VendorManagement />}
          
          {activeTab === 'reports' && (
            <div className="glass-panel" style={{ padding: '64px', textAlign: 'center' }}>
              <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Reports</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Advanced reporting module coming in Phase 2.</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="glass-panel" style={{ padding: '64px', textAlign: 'center' }}>
              <BarChart size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Analytics</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Predictive analytics and ML insights coming in Phase 2.</p>
            </div>
          )}
          {activeTab === 'budgets' && (
            <div className="glass-panel" style={{ padding: '64px', textAlign: 'center' }}>
              <PieChart size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Budgets</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Departmental budget tracking coming in Phase 2.</p>
            </div>
          )}

          {/* AI Copilot Tab */}
          {activeTab === 'copilot' && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '520px' }}>
               <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg, index) => (
                  <div key={index} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? 'var(--accent-electric)' : 'var(--bg-primary)', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', padding: '12px 16px', borderRadius: '14px', maxWidth: '75%', fontSize: '0.9rem', border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none' }}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about spending trends..." style={{ flex: 1, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)' }} />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Cryptographic Event Ledger Chain</h3>
                <button onClick={handleVerifyLedger} disabled={verifying} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {verifying ? 'Verifying...' : 'Run Integrity Check'}
                </button>
              </div>

              {verifyResult && (
                <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '8px', backgroundColor: verifyResult.isValid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${verifyResult.isValid ? 'var(--status-green)' : 'var(--status-red)'}` }}>
                  <h4 style={{ fontWeight: 600, color: verifyResult.isValid ? 'var(--status-green)' : 'var(--status-red)', marginBottom: '4px' }}>
                    {verifyResult.isValid ? 'Ledger is Authentic' : 'Tampering Detected'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Checked {verifyResult.totalChecked} blocks. {verifyResult.tamperedIds.length > 0 && `Tampered block IDs: ${verifyResult.tamperedIds.join(', ')}`}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {expenses.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No real expenses synchronized from DB yet.</div>}
                {expenses.map((exp, idx) => {
                  const isTampered = verifyResult?.tamperedIds.includes(exp.id);
                  return (
                    <div key={exp.id} className="glass-panel" style={{ padding: '16px', borderLeft: `4px solid ${isTampered ? 'var(--status-red)' : 'var(--accent-electric)'}`, display: 'flex', justifyContent: 'space-between', backgroundColor: isTampered ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: isTampered ? 'var(--status-red)' : 'var(--text-primary)', fontWeight: 600 }}>Block #{idx + 1} — {exp.vendor} {isTampered && '(TAMPERED)'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Prev Hash: {exp.prevEventHash || '0000000000000000'}</div>
                        <div style={{ fontSize: '0.75rem', color: isTampered ? 'var(--status-red)' : 'var(--status-green)', fontFamily: 'monospace', fontWeight: 600 }}>Event Hash: {exp.eventHash}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tenancy Tab */}
          {activeTab === 'tenancy' && (
             <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Adaptive Tenancy Router Details</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Our intelligent engine automatically evaluates your company portfolio and dynamically allocates you to the optimal database architecture.
              </p>

              {activeTenant?.routingReason && (
                <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid var(--accent-electric)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '8px', backgroundColor: 'rgba(37, 99, 235, 0.15)', borderRadius: '8px', color: 'var(--accent-electric)' }}>
                    <Network size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--accent-electric)', marginBottom: '6px', fontSize: '0.95rem' }}>AI Architecture Decision</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {activeTenant.routingReason}
                    </p>
                  </div>
                </div>
              )}


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: activeTenant?.routingStrategy === 'SHARED' ? 'rgba(37, 99, 235, 0.05)' : 'transparent', border: activeTenant?.routingStrategy === 'SHARED' ? '1px solid var(--accent-electric)' : '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: activeTenant?.routingStrategy === 'SHARED' ? 'var(--accent-electric)' : 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>Shared Schema Pool (Postgres RLS)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Designed for standard volume companies. Isolates data securely via row-level security.
                  </p>
                  {activeTenant?.routingStrategy === 'SHARED' && (
                    <span style={{ padding: '4px 8px', background: 'var(--accent-electric)', color: 'white', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>Your active routing strategy</span>
                  )}
                </div>

                <div style={{ background: activeTenant?.routingStrategy === 'DEDICATED' ? 'var(--status-amber-bg)' : 'transparent', border: activeTenant?.routingStrategy === 'DEDICATED' ? '1px solid var(--status-amber)' : '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: activeTenant?.routingStrategy === 'DEDICATED' ? 'var(--status-amber)' : 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>Dedicated Tenant Schema</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    For high-volume transaction expected profiles or STRICT data sensitivity requirements.
                  </p>
                  {activeTenant?.routingStrategy === 'DEDICATED' && (
                    <span style={{ padding: '4px 8px', background: 'var(--status-amber)', color: 'white', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>Your active routing strategy</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
