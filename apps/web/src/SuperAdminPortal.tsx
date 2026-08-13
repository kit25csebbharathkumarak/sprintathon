import { useState } from 'react';
import { 
  Home, Building2, Users, CreditCard, Receipt, BarChart3, Activity, 
  ArrowRightLeft, Tags, FileText, Link, Settings, Bell, 
  Calendar, MoreHorizontal, ArrowUpRight, CheckCircle2, 
  Search, ArrowRight, User, FilePlus, ArrowDownRight, FileSearch
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  XAxis, YAxis, CartesianGrid 
} from 'recharts';

// --- Mock Data ---
const revenueData = [
  { name: '1 Aug', revenue: 1900000 },
  { name: '3 Aug', revenue: 2200000 },
  { name: '5 Aug', revenue: 2900000 },
  { name: '7 Aug', revenue: 245300 }, // Matches the tooltip in screenshot
  { name: '9 Aug', revenue: 3100000 },
  { name: '11 Aug', revenue: 2900000 },
  { name: '13 Aug', revenue: 3300000 },
];

const topTenantsData = [
  { name: 'Acme Corporation', value: 624500, color: '#3b82f6' },
  { name: 'Globex Solutions', value: 475200, color: '#8b5cf6' },
  { name: 'Initech Pvt Ltd', value: 315000, color: '#10b981' },
  { name: 'Umbrella Corp', value: 282750, color: '#f59e0b' },
  { name: 'Stark Industries', value: 210800, color: '#ef4444' },
];

const subscriptionData = [
  { name: 'Enterprise', value: 32, percentage: '25%', color: '#3b82f6' },
  { name: 'Professional', value: 58, percentage: '45%', color: '#8b5cf6' },
  { name: 'Basic', value: 28, percentage: '22%', color: '#10b981' },
  { name: 'Free Trial', value: 10, percentage: '8%', color: '#f59e0b' },
];

const recentActivity = [
  { id: 1, title: 'New tenant "TechNova Solutions" signed up', time: '13 Aug 2026, 11:30 AM', icon: Building2, color: '#10b981', bg: '#d1fae5' },
  { id: 2, title: 'Invoice INV-2026-0813-005 generated', time: '13 Aug 2026, 10:15 AM', icon: Receipt, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 3, title: 'Plan upgraded by Globex Solutions', time: '13 Aug 2026, 09:45 AM', icon: ArrowUpRight, color: '#3b82f6', bg: '#dbeafe' },
  { id: 4, title: 'Payment received from Acme Corporation', time: '13 Aug 2026, 09:20 AM', icon: CreditCard, color: '#10b981', bg: '#d1fae5' },
  { id: 5, title: 'User role updated in Initech Pvt Ltd', time: '13 Aug 2026, 08:50 AM', icon: User, color: '#f59e0b', bg: '#fef3c7' },
];

const allTenants = [
  { id: 1, name: 'Acme Corporation', plan: 'Enterprise', users: 120, status: 'Active', revenue: '₹6,24,500' },
  { id: 2, name: 'Globex Solutions', plan: 'Professional', users: 45, status: 'Active', revenue: '₹4,75,200' },
  { id: 3, name: 'Initech Pvt Ltd', plan: 'Professional', users: 30, status: 'Active', revenue: '₹3,15,000' },
  { id: 4, name: 'Umbrella Corp', plan: 'Enterprise', users: 200, status: 'Active', revenue: '₹2,82,750' },
  { id: 5, name: 'Stark Industries', plan: 'Basic', users: 10, status: 'Inactive', revenue: '₹2,10,800' },
];

export default function SuperAdminPortal({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');

  const navItems = [
    { name: 'Overview', icon: Home, id: 'Overview' },
    { name: 'Tenants', icon: Building2, id: 'Tenants' },
    { name: 'Users', icon: Users, id: 'Users' },
    { name: 'Subscriptions', icon: CreditCard, id: 'Subscriptions' },
    { name: 'Billing & Invoices', icon: Receipt, id: 'Billing' },
    { name: 'Plans', icon: FileText, id: 'Plans' },
    { name: 'System Usage', icon: Activity, id: 'SystemUsage' },
    { name: 'Transactions', icon: ArrowRightLeft, id: 'Transactions' },
    { name: 'Categories', icon: Tags, id: 'Categories' },
    { name: 'Reports', icon: BarChart3, id: 'Reports' },
    { name: 'Audit Logs', icon: FileSearch, id: 'AuditLogs' },
    { name: 'Integrations', icon: Link, id: 'Integrations' },
    { name: 'Settings', icon: Settings, id: 'Settings' },
  ];

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
                <span style={{ color: 'white' }}>128 / 200</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '64%', height: '100%', backgroundColor: '#3b82f6' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Storage Used</span>
                <span style={{ color: 'white' }}>245 GB / 1 TB</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '24%', height: '100%', backgroundColor: '#8b5cf6' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>API Requests</span>
                <span style={{ color: 'white' }}>1.2M / 5M</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '24%', height: '100%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>

            <button style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>
              <Calendar size={16} /> 01 Aug 2026 - 13 Aug 2026 <ArrowRightLeft size={14} style={{ transform: 'rotate(90deg)' }} />
            </button>
            
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#64748b" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onLogout}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* Stat Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Tenants</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>128</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowUpRight size={14} /> 12 this month
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Users</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>2,453</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowUpRight size={14} /> 18 this month
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Revenue</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>₹24,78,250</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowUpRight size={14} /> 14.3% vs last month
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={20} color="#a855f7" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Expenses Tracked</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>18,924</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowUpRight size={14} /> 16.8% vs last month
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#f97316" />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Invoices Generated</div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>3,215</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowUpRight size={14} /> 11.2% vs last month
              </div>
            </div>
          </div>

          {/* Main Grid: Charts & Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            
            {/* Revenue Overview */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Revenue Overview</h3>
                <button style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  This Month <ArrowDownRight size={14} style={{ transform: 'rotate(-45deg)' }} />
                </button>
              </div>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val/100000}L`} />
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 24px 0' }}>Top 5 Tenants by Revenue</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topTenantsData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {topTenantsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>₹24,78,250</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total Revenue</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topTenantsData.map((t, i) => (
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
                <a href="#" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>View All</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: activity.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color={activity.color} />
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
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Search tenants..." style={{ padding: '8px 12px 8px 32px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', width: '200px' }} />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Tenant Name</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Plan</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Users</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Revenue (This Month)</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTenants.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{t.name}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>{t.plan}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#64748b' }}>{t.users}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', fontWeight: 500, color: t.status === 'Active' ? '#10b981' : '#ef4444' }}>{t.status}</td>
                      <td style={{ padding: '14px 8px', fontSize: '0.85rem', color: '#1e293b' }}>{t.revenue}</td>
                      <td style={{ padding: '14px 8px', color: '#94a3b8' }}><MoreHorizontal size={18} style={{ cursor: 'pointer' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '16px' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View all tenants <ArrowRight size={14} />
                </a>
              </div>
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
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>128</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Total Tenants</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {subscriptionData.map((s, i) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>Storage</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>Backup</span>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 20px 0' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#3b82f6' }}><Building2 size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Add New Tenant</div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#10b981' }}><FilePlus size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Create Invoice</div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#8b5cf6' }}><Settings size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Manage Plans</div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#f59e0b' }}><FileText size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>View Reports</div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#3b82f6' }}><Settings size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>System Settings</div>
                </button>

                <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ color: '#ef4444' }}><FileSearch size={20} /></div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>Audit Logs</div>
                </button>

              </div>
            </div>

          </div>

          {/* Footer */}
          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0 0 0', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              © 2026 4D Expense. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>Documentation</a>
              <a href="#" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>Support</a>
              <a href="#" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
