import { useState, useEffect } from 'react';
import { 
  Home, Building2, CreditCard, Receipt, BarChart3, Activity, 
  ArrowRightLeft, FileText, Link, Settings, 
  CheckCircle2, ArrowRight, User, FilePlus, FileSearch, Search
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  XAxis, YAxis, CartesianGrid 
} from 'recharts';

export default function SuperAdminPortal({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState('Enterprise');
  const [phase2ModalOpen, setPhase2ModalOpen] = useState<{ isOpen: boolean; feature: string }>({ isOpen: false, feature: '' });

  const navItems = [
    { name: 'Overview', icon: Home, id: 'Overview' },
    { name: 'Tenants', icon: Building2, id: 'Tenants' },
    { name: 'Subscriptions', icon: CreditCard, id: 'Subscriptions' },
    { name: 'Billing & Invoices', icon: Receipt, id: 'Billing' },
    { name: 'System Usage', icon: Activity, id: 'SystemUsage' },
    { name: 'Transactions', icon: ArrowRightLeft, id: 'Transactions' },
    { name: 'Reports', icon: BarChart3, id: 'Reports' },
    { name: 'Audit Logs', icon: FileSearch, id: 'AuditLogs' },
    { name: 'Integrations', icon: Link, id: 'Integrations' },
    { name: 'Settings', icon: Settings, id: 'Settings' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTenant = async () => {
    if (!newTenantName) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/admin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTenantName, plan: newTenantPlan })
      });
      setIsTenantModalOpen(false);
      setNewTenantName('');
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.allTenants) return;
    const headers = ['ID', 'Name', 'Plan', 'Users', 'Status', 'Revenue'];
    const rows = data.allTenants.map((t: any) => [t.id, `"${t.name}"`, t.plan, t.users, t.status, `"${t.revenue}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tenants_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const {
    totalTenants = 0,
    totalUsers = 0,
    totalRevenue = 0,
    expensesTracked = 0,
    invoicesGenerated = 0,
    revenueData = [],
    topTenants = [],
    subscriptionData = [],
    recentActivity = [],
    allTenants = []
  } = data || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#94a3b8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo Area */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
              4D
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>EXPENSE</div>
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '4px', paddingLeft: '42px', color: '#cbd5e1' }}>SaaS Admin Portal</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? 'white' : '#cbd5e1',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 0.2s',
                  marginBottom: '2px'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.id !== 'Overview' && <span style={{ opacity: isActive ? 1 : 0.5 }}>›</span>}
              </button>
            )
          })}
        </nav>

        {/* Platform Usage Box */}
        <div style={{ padding: '20px 12px', marginTop: 'auto' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '4px', fontWeight: 600 }}>Platform Usage</h4>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '16px' }}>This Month</div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Active Tenants</span>
                <span style={{ color: 'white' }}>{totalTenants} / 200</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (totalTenants / 200) * 100)}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
              </div>
            </div>

            <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'Usage Analytics' })} style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
              View Usage Analytics <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Welcome back, Admin! 👋</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Here's what's happening across your platform today.</p>
          </div>
          <div>
            <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {activeTab === 'Overview' && (
            <>
              {/* Stat Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Tenants</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{totalTenants}</div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Users</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{totalUsers}</div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Revenue Tracked</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>₹{totalRevenue.toLocaleString()}</div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={20} color="#a855f7" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Expenses Tracked</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{expensesTracked}</div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#f97316" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Invoices Generated</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{invoicesGenerated}</div>
            </div>
          </div>

          {/* Main Grid: Charts & Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            
            {/* Revenue Overview */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Revenue Overview</h3>
              </div>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', color: 'white', borderRadius: '8px', border: 'none', padding: '8px 12px' }}
                      itemStyle={{ color: 'white', fontSize: '0.9rem' }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 5 Tenants */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 24px 0' }}>Top Tenants by Tracked Expense</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topTenants} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {topTenants.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>₹{totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topTenants.map((t: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.color }}></div>
                      <span style={{ color: '#64748b' }}>{t.name}</span>
                    </div>
                    <span style={{ color: '#1e293b', fontWeight: 500 }}>₹{t.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Recent Activity</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {recentActivity.map((activity: any) => {
                  return (
                    <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: activity.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={16} color={activity.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>{activity.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{activity.time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', paddingBottom: '40px' }}>
            
            {/* All Tenants Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>All Tenants</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Tenant Name</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Plan</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Users</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Revenue (Tracked)</th>
                  </tr>
                </thead>
                <tbody>
                  {allTenants.map((t: any) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{t.name}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>{t.plan}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>{t.users}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', fontWeight: 500, color: t.status === 'Active' ? '#10b981' : '#ef4444' }}>{t.status}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#1e293b' }}>{t.revenue}</td>
                    </tr>
                  ))}
                  {allTenants.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No tenants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Subscription & System */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px 0' }}>Subscription Overview</h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={subscriptionData} innerRadius={50} outerRadius={65} paddingAngle={2} dataKey="value">
                          {subscriptionData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{totalTenants}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Total Tenants</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {subscriptionData.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }}></div>
                          <span style={{ color: '#64748b' }}>{s.name}</span>
                        </div>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{s.value} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({s.percentage})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px 0' }}>System Health</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>API Status</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>DB Status</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px 0' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <button onClick={() => setIsTenantModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#3b82f6' }}><Building2 size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Add New Tenant</div>
                </button>

                <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'Create Invoice' })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#10b981' }}><FilePlus size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Create Invoice</div>
                </button>

                <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'Manage Plans' })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#8b5cf6' }}><Settings size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Manage Plans</div>
                </button>

                <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#f59e0b' }}><FileText size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>View Reports</div>
                </button>

                <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'System Settings' })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#3b82f6' }}><Settings size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>System Settings</div>
                </button>

                <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'Audit Logs' })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#ef4444' }}><FileSearch size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Audit Logs</div>
                </button>

              </div>
            </div>

          </div>
          </>
          )}

          {activeTab === 'Tenants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#1e293b' }}>Manage Tenants</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>View and manage all active organizations on the platform.</p>
                </div>
                <button onClick={() => setIsTenantModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                  <Building2 size={16} /> Add New Tenant
                </button>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search tenants..." style={{ padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', width: '250px' }} />
                  </div>
                  <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', color: '#64748b', fontSize: '0.85rem' }}>
                    <FileText size={16} /> Export CSV
                  </button>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Tenant Name</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Plan Tier</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Active Users</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Status</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Tracked Spend</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTenants.map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>{t.name}</td>
                        <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: '#64748b' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: t.plan === 'Enterprise' ? '#eff6ff' : '#f3e8ff', color: t.plan === 'Enterprise' ? '#3b82f6' : '#a855f7', fontSize: '0.75rem', fontWeight: 600 }}>{t.plan}</span>
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: '#64748b' }}>{t.users} users</td>
                        <td style={{ padding: '16px 8px', fontSize: '0.85rem', fontWeight: 500, color: t.status === 'Active' ? '#10b981' : '#ef4444' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: t.status === 'Active' ? '#10b981' : '#ef4444' }}></div>
                            {t.status}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{t.revenue}</td>
                        <td style={{ padding: '16px 8px', color: '#94a3b8', textAlign: 'right' }}>
                           <button onClick={() => setPhase2ModalOpen({ isOpen: true, feature: 'Manage Tenant' })} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, color: '#1e293b' }}>Manage</button>
                        </td>
                      </tr>
                    ))}
                    {allTenants.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No tenants found on the platform.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && activeTab !== 'Tenants' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: '#64748b' }}>
              <Settings size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
              <h2 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{activeTab} Module</h2>
              <p style={{ margin: 0 }}>This section is currently under construction and will be available in Phase 2.</p>
            </div>
          )}

          {/* Footer */}
          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 0 0', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              © 2026 4D Expense. All rights reserved.
            </div>
          </footer>

        </div>
      </main>

      {/* Add Tenant Modal */}
      {isTenantModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem' }}>Add New Tenant</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>Tenant Name</label>
              <input 
                type="text" 
                value={newTenantName} 
                onChange={(e) => setNewTenantName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>Plan Tier</label>
              <select 
                value={newTenantPlan} 
                onChange={(e) => setNewTenantPlan(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}
              >
                <option value="Enterprise">Enterprise (Dedicated Schema)</option>
                <option value="Professional">Professional (Shared Schema)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsTenantModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleCreateTenant} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Create Tenant</button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2 Modal */}
      {phase2ModalOpen.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Settings size={24} color="#3b82f6" />
            </div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>Phase 2 Feature</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              The <strong>{phase2ModalOpen.feature}</strong> module is scheduled for implementation in Phase 2 of the dashboard rollout.
            </p>
            <button onClick={() => setPhase2ModalOpen({ isOpen: false, feature: '' })} style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500, width: '100%' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
