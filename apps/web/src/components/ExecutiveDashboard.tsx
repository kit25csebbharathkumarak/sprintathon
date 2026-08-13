import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, PieChart as PieChartIcon, 
  Clock, AlertTriangle, Briefcase, 
  Target, ShieldAlert, Zap
} from 'lucide-react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#0f172a', '#475569'];

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/v1/dashboard/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  return (
    <div className="fade-in">
      
      {/* Top KPI Cards Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <KpiCard title="Total Spend YTD" value={`₹${data.totalSpendYtd.toLocaleString('en-IN')}`} trend="+12%" icon={DollarSign} color="var(--accent-electric)" />
        <KpiCard title="Monthly Spend (Jun)" value={`₹${data.monthlySpend.toLocaleString('en-IN')}`} trend="+15%" icon={TrendingUp} color="var(--status-amber)" />
        <KpiCard title="Budget Utilization" value={`${data.budgetUtilization}%`} trend="-2%" icon={PieChartIcon} color="var(--status-green)" />
        <KpiCard title="Cost Savings" value={`₹${data.costSavings.toLocaleString('en-IN')}`} trend="+5%" icon={Zap} color="var(--status-green)" />
        <KpiCard title="Policy Violations" value={data.policyViolations} trend="-3" icon={ShieldAlert} color="var(--status-red)" />
      </div>

      {/* Top KPI Cards Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KpiCard title="Pending Approvals" value={data.pendingApprovals} icon={Clock} color="var(--status-amber)" neutral />
        <KpiCard title="Pending Reimbursements" value={`₹${data.pendingReimbursements.toLocaleString('en-IN')}`} icon={Clock} color="var(--status-amber)" neutral />
        <KpiCard title="Outstanding Expenses" value={`₹${data.outstandingExpenses.toLocaleString('en-IN')}`} icon={AlertTriangle} color="var(--status-red)" neutral />
        <KpiCard title="Top Project Spend" value={data.topProject.name} sub={` (₹${(data.topProject.amount/1000).toFixed(1)}k)`} icon={Briefcase} color="var(--accent-electric)" neutral />
        <KpiCard title="Top Dept Spend" value={data.topDept.name} sub={` (₹${(data.topDept.amount/100000).toFixed(2)}L)`} icon={Target} color="var(--bg-navy)" neutral />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Budget vs Actual Trend */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Spending Trend: Budget vs Actual</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-electric)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-electric)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(val: any) => `₹${val.toLocaleString('en-IN')}`} />
                <Legend />
                <Area type="monotone" dataKey="actual" name="Actual Spend" stroke="var(--accent-electric)" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                <Line type="monotone" dataKey="budget" name="Budget" stroke="var(--status-amber)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Department Spend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="spend">
                  {data.deptData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(val: any) => `₹${val.toLocaleString('en-IN')}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Top Expense Categories */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>Top Expense Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.topCategories.map((c: any, i: number) => (
               <InsightRow key={i} label={c.label} value={c.value} percentage={c.percentage} color={c.color} />
            ))}
          </div>
        </div>

        {/* Top Vendors (Mocked to show visually) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>Top Vendors by Spend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <InsightRow label="Amazon Web Services" value="₹85,000" />
             <InsightRow label="Salesforce" value="₹42,000" />
             <InsightRow label="Delta Airlines" value="₹18,500" />
             <InsightRow label="Marriott Hotels" value="₹12,200" />
          </div>
        </div>

        {/* Unusual Spending (Fraud/AI flagged) */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '4px solid var(--status-red)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} /> Unusual Spending Detected
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <AlertRow msg="Duplicate Uber receipts submitted by J. Doe" severity="high" />
             <AlertRow msg="Weekend spending spike in 'Meals' category" severity="medium" />
             <AlertRow msg="Unrecognized vendor: 'CryptoHost LLC' (₹4,500)" severity="high" />
             <button className="btn-secondary" style={{ marginTop: '8px', padding: '8px', fontSize: '0.8rem' }}>View All Audit Logs</button>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, trend, icon: Icon, color, neutral }: any) {
  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
        <div style={{ backgroundColor: `${color}15`, padding: '8px', borderRadius: '10px' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{sub}</span>
      </div>
      {trend && !neutral && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: trend.startsWith('+') ? (title.includes('Violations') ? 'var(--status-red)' : 'var(--status-green)') : (title.includes('Violations') ? 'var(--status-green)' : 'var(--status-red)'), fontWeight: 600 }}>
           {trend} vs last month
        </div>
      )}
      {neutral && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Needs attention</div>
      )}
    </div>
  )
}

function InsightRow({ label, value, percentage, color }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{value}</span>
      </div>
      {percentage && (
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: percentage, height: '100%', backgroundColor: color }}></div>
        </div>
      )}
    </div>
  )
}

function AlertRow({ msg, severity }: any) {
  const isHigh = severity === 'high';
  return (
    <div style={{ padding: '12px', backgroundColor: isHigh ? 'var(--status-red-bg)' : 'var(--status-amber-bg)', border: isHigh ? '1px solid var(--status-red)' : '1px solid var(--status-amber)', borderRadius: '8px', fontSize: '0.85rem', color: isHigh ? 'var(--status-red)' : 'var(--status-amber)', display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: 500 }}>
      <div style={{ marginTop: '4px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isHigh ? 'var(--status-red)' : 'var(--status-amber)', flexShrink: 0 }}></div>
      {msg}
    </div>
  )
}
