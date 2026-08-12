import React, { useState, useEffect } from 'react';

// Interfaces
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
  dataSensitivity?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  
  // Login Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Comprehensive Signup Fields
  const [companyName, setCompanyName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [numberOfBranches, setNumberOfBranches] = useState('');
  const [annualTurnover, setAnnualTurnover] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState('Technology');
  const [dataSensitivity, setDataSensitivity] = useState('STANDARD');
  const [expectedTxVolume, setExpectedTxVolume] = useState('');
  const [enterpriseRequirements, setEnterpriseRequirements] = useState('');
  
  const [authError, setAuthError] = useState('');

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'expenses' | 'copilot' | 'audit' | 'tenancy'>('expenses');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Form State
  const [newVendor, setNewVendor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! Ask me anything about your team\'s spending.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Load active tenant from storage if logged in
  useEffect(() => {
    const storedTenant = localStorage.getItem('tenant');
    if (storedTenant) {
      try {
        setActiveTenant(JSON.parse(storedTenant));
        fetchExpenses(localStorage.getItem('token') || '');
      } catch {}
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';
      const body = isLogin 
        ? { email, password } 
        : { 
            companyName, email, password,
            employeeCount, numberOfBranches, annualTurnover,
            gstin, businessType, dataSensitivity, expectedTxVolume, enterpriseRequirements
          };
      
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setToken(data.token);
      setActiveTenant(data.tenant);
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));

      fetchExpenses(data.token);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setActiveTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tenant');
    setExpenses([]);
  };

  const fetchExpenses = async (jwt: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/expenses', {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (res.ok) {
        setExpenses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount || !token) return;

    try {
      const res = await fetch('http://localhost:3001/api/v1/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor: newVendor,
          amount: parseFloat(newAmount),
          category: newCategory,
          date: new Date().toISOString()
        })
      });

      if (res.ok) {
        const newEntry = await res.json();
        setExpenses([newEntry, ...expenses]);
        setNewVendor('');
        setNewAmount('');
        setShowAddModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOcrSimulate = () => {
    setIsOcrProcessing(true);
    setTimeout(() => {
      setNewVendor('Uber Trip Inc');
      setNewAmount('64.20');
      setNewCategory('Travel & Transit');
      setIsOcrProcessing(false);
    }, 1200);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !token) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    try {
      const res = await fetch('http://localhost:3001/api/v1/expenses/copilot', {
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

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0c10', padding: '40px' }}>
        <div className="glass-panel" style={{ width: isLogin ? '400px' : '800px', padding: '40px', transition: 'width 0.3s ease' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '28px', color: 'white', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>Æ</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>AetherLedger</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: '8px' }}>
              {isLogin ? 'Sign in to your isolated workspace' : 'B2B Enterprise Registration & Profiling'}
            </p>
          </div>

          {authError && (
            <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '12px', borderRadius: '8px', color: '#fb7185', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* LOGIN FORM */}
            {isLogin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="email" placeholder="Admin Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
              </div>
            )}

            {/* EXTENDED SIGNUP FORM */}
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Column 1: Core Account Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#818cf8', marginBottom: '8px' }}>1. Account Details</h3>
                  <input type="text" placeholder="Registered Company Name *" required value={companyName} onChange={e => setCompanyName(e.target.value)} style={inputStyle} />
                  <input type="email" placeholder="Admin Email *" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  <input type="password" placeholder="Password *" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="GSTIN / Tax ID" value={gstin} onChange={e => setGstin(e.target.value)} style={inputStyle} />
                  
                  <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={inputStyle}>
                    <option value="Technology">Technology & IT</option>
                    <option value="Finance">Financial Services</option>
                    <option value="Retail">Retail & E-Commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                {/* Column 2: Business Profiling (Used for Tenancy Routing) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#818cf8', marginBottom: '8px' }}>2. Scale & Security Profiling</h3>
                  
                  <input type="number" placeholder="Total Employee Count" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} style={inputStyle} />
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="number" placeholder="Branches" value={numberOfBranches} onChange={e => setNumberOfBranches(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" placeholder="Est. Annual Turnover ($)" value={annualTurnover} onChange={e => setAnnualTurnover(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
                  </div>

                  <input type="number" placeholder="Expected Monthly Transactions (Volume)" value={expectedTxVolume} onChange={e => setExpectedTxVolume(e.target.value)} style={inputStyle} />

                  <select value={dataSensitivity} onChange={e => setDataSensitivity(e.target.value)} style={inputStyle}>
                    <option value="STANDARD">Standard Data Sensitivity</option>
                    <option value="HIGH">High Sensitivity (PII / Financial)</option>
                    <option value="STRICT">Strict / Dedicated Schema Required</option>
                  </select>

                  <input type="text" placeholder="Custom Enterprise Requirements..." value={enterpriseRequirements} onChange={e => setEnterpriseRequirements(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '16px' }}>
              {isLogin ? 'Sign In to Workspace' : 'Initialize Isolated Tenant Environment'}
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: '#9ca3af' }}>
            {isLogin ? "Is your company new to AetherLedger? " : "Already have a registered environment? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
              {isLogin ? 'Register Company Profile' : 'Log in here'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0c10' }}>
      {/* Top Navbar */}
      <nav className="glass-nav" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white' }}>Æ</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>AetherLedger</h1>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Workspace: {activeTenant?.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px' }}>
            <span className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Triple-Layer Isolated</span>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Log Out</button>
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Total Tenant Expenses</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f3f4f6' }}>${expenses.reduce((acc, item) => acc + Number(item.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '6px' }}>{expenses.length} Records</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Tenancy Routing & Scale</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: activeTenant?.routingStrategy === 'DEDICATED' ? '#f59e0b' : '#06b6d4' }}>
              {activeTenant?.routingStrategy}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>Sensitivity: {activeTenant?.dataSensitivity}</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Fraud Flags</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: expenses.some(e => e.status === 'FLAGGED') ? '#f43f5e' : '#34d399' }}>
              {expenses.filter(e => e.status === 'FLAGGED').length} Anomaly
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #262938', marginBottom: '24px', gap: '8px' }}>
          {[
            { id: 'expenses', label: '💳 Expenses & Ledger' }, 
            { id: 'copilot', label: '🤖 AI Expense Copilot' }, 
            { id: 'audit', label: '⛓️ Tamper Hash Audit' },
            { id: 'tenancy', label: '⚡ Adaptive Tenancy Router' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '12px 20px', background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent', color: activeTab === tab.id ? '#818cf8' : '#9ca3af', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Ledger</h2>
              <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add New Expense</button>
            </div>
            
            {expenses.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <p>No expenses found in your isolated tenant.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #262938', color: '#9ca3af', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Vendor</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Hash Block</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #1c1f2b', fontSize: '0.9rem' }}>
                      <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 600 }}>{exp.vendor}</td>
                      <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{exp.category}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700 }}>${Number(exp.amount).toFixed(2)}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: exp.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : exp.status === 'FLAGGED' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: exp.status === 'APPROVED' ? '#34d399' : exp.status === 'FLAGGED' ? '#fb7185' : '#fbbf24' }}>
                          {exp.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}><div className="hash-tag" title={`Prev: ${exp.prevEventHash}`}>{exp.eventHash?.slice(0, 16)}...</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* AI Copilot Tab */}
        {activeTab === 'copilot' && (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '520px' }}>
             <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#4f46e5' : '#1c1f2b', color: '#f3f4f6', padding: '12px 16px', borderRadius: '14px', maxWidth: '75%', fontSize: '0.9rem' }}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about spending trends..." style={{ flex: 1, backgroundColor: '#0b0c10', border: '1px solid #262938', borderRadius: '10px', padding: '12px 16px', color: '#f3f4f6' }} />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Cryptographic Event Ledger Chain</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {expenses.map((exp, idx) => (
                <div key={exp.id} className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid #6366f1', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>Block #{idx + 1} — {exp.vendor}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>Prev Hash: {exp.prevEventHash || '0000000000000000'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace' }}>Event Hash: {exp.eventHash}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tenancy Tab */}
        {activeTab === 'tenancy' && (
           <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Adaptive Tenancy Router Details</h3>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '24px' }}>
              AetherLedger automatically promotes high-volume enterprise profiles to dedicated schemas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div style={{ background: activeTenant?.routingStrategy === 'SHARED' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: activeTenant?.routingStrategy === 'SHARED' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #262938', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: activeTenant?.routingStrategy === 'SHARED' ? '#818cf8' : '#9ca3af', marginBottom: '8px' }}>Shared Schema Pool (Postgres RLS)</h4>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
                  Designed for standard volume companies. Isolates data securely via row-level security.
                </p>
                {activeTenant?.routingStrategy === 'SHARED' && (
                  <span style={{ padding: '4px 8px', background: '#6366f1', color: 'white', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>Your active routing strategy</span>
                )}
              </div>

              <div style={{ background: activeTenant?.routingStrategy === 'DEDICATED' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', border: activeTenant?.routingStrategy === 'DEDICATED' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #262938', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: activeTenant?.routingStrategy === 'DEDICATED' ? '#f59e0b' : '#9ca3af', marginBottom: '8px' }}>Dedicated Tenant Schema</h4>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
                  For high-volume transaction expected profiles or STRICT data sensitivity requirements.
                </p>
                {activeTenant?.routingStrategy === 'DEDICATED' && (
                  <span style={{ padding: '4px 8px', background: '#f59e0b', color: 'white', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>Your active routing strategy</span>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Add Expense Claim</h3>
            <div style={{ marginBottom: '20px', padding: '14px', border: '2px dashed #34384c', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={handleOcrSimulate}>
              <span style={{ fontSize: '0.85rem', color: isOcrProcessing ? '#818cf8' : '#9ca3af' }}>
                {isOcrProcessing ? '⚡ Scanning Receipt...' : '📄 Click to Upload Receipt'}
              </span>
            </div>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" required value={newVendor} onChange={e => setNewVendor(e.target.value)} placeholder="Vendor Name" style={inputStyle} />
              <input type="number" step="0.01" required value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Amount" style={inputStyle} />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={inputStyle}>
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Travel & Transit">Travel & Transit</option>
                <option value="Meals">Meals</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '12px', 
  backgroundColor: '#0b0c10', 
  border: '1px solid #262938', 
  borderRadius: '8px', 
  color: 'white',
  fontSize: '0.9rem',
  width: '100%'
};
