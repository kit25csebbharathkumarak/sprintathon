import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Check, X, MessageSquare, Download, Filter, Plus } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function ExpenseManagement() {
  const [view, setView] = useState<'employee' | 'finance'>('employee');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('tenant');
    if (t) setTenant(JSON.parse(t));
  }, []);

  const fetchExpenses = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/api/v1/expenses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          console.error('API Error:', data);
          setExpenses([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="fade-in">
      
      {/* Internal Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setView('employee')} 
          style={{ padding: '8px 16px', background: view === 'employee' ? 'var(--bg-surface)' : 'transparent', color: view === 'employee' ? 'var(--accent-electric)' : 'var(--text-secondary)', border: view === 'employee' ? '1px solid var(--border-color)' : '1px solid transparent', borderBottom: view === 'employee' ? '2px solid var(--accent-electric)' : 'none', borderRadius: view === 'employee' ? '6px 6px 0 0' : '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          My Claims
        </button>
        <button 
          onClick={() => setView('finance')} 
          style={{ padding: '8px 16px', background: view === 'finance' ? 'var(--bg-surface)' : 'transparent', color: view === 'finance' ? 'var(--accent-electric)' : 'var(--text-secondary)', border: view === 'finance' ? '1px solid var(--border-color)' : '1px solid transparent', borderBottom: view === 'finance' ? '2px solid var(--accent-electric)' : 'none', borderRadius: view === 'finance' ? '6px 6px 0 0' : '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Finance Review
        </button>
      </div>

      {view === 'employee' ? (
        <EmployeeView expenses={expenses} tenant={tenant} onAddClick={() => { setEditingExpense(null); setShowModal(true); }} onEditClick={(exp) => { setEditingExpense(exp); setShowModal(true); }} onRefresh={fetchExpenses} />
      ) : (
        <FinanceView expenses={expenses} tenant={tenant} onRefresh={fetchExpenses} />
      )}

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <ExpenseModal expense={editingExpense} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchExpenses(); }} />
      )}

    </div>
  );
}

function ExpenseModal({ expense, onClose, onSaved }: { expense?: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    vendor: expense?.vendor || '',
    date: expense ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: expense?.category || 'Software Licenses',
    department: expense?.department || 'Engineering',
    project: expense?.project || 'Project Alpha',
    purpose: expense?.purpose || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!formData.vendor) formData.vendor = 'Unknown Vendor'; 

    const url = expense ? `${API_BASE}/api/v1/expenses/${expense.id}` : `${API_BASE}/api/v1/expenses`;
    const method = expense ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        amount: parseFloat(formData.amount as string),
        currency: 'INR'
      })
    });
    
    onSaved();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>{expense ? 'Edit Expense Claim' : 'Create Expense Claim'}</h3>
        
        <div style={{ marginBottom: '20px', padding: '24px', border: '2px dashed var(--border-heavy)', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }} className="table-row-hover">
          <UploadCloud size={32} color="var(--accent-electric)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Click or drag receipt to upload</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>PNG, JPG or PDF (max 10MB)</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Amount (₹) *</label>
              <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={inputStyle} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div>
              <label style={labelStyle}>Category *</label>
              <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Software Licenses</option>
                <option>Travel & Flights</option>
                <option>Hotels & Lodging</option>
                <option>Meals & Ent.</option>
                <option>Hardware</option>
                <option>Office Supplies</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Vendor Name *</label>
              <input type="text" required value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} placeholder="e.g. Amazon Web Services" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select style={inputStyle} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option>Engineering</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Project</label>
              <select style={inputStyle} value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})}>
                <option>Project Alpha</option>
                <option>Project Beta</option>
                <option>Q3 Roadshow</option>
                <option>Rebranding</option>
                <option>General OpEx</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Business Purpose</label>
            <textarea rows={2} value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="Explain why this expense was necessary..." style={{ ...inputStyle, resize: 'none' }}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>{expense ? 'Save Changes' : 'Submit for Approval'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeView({ expenses, tenant, onAddClick, onEditClick, onRefresh }: { expenses: any[], tenant: any, onAddClick: () => void, onEditClick: (exp: any) => void, onRefresh: () => void }) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/api/v1/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    onRefresh();
  };

  // Assuming all returned expenses belong to the user based on tenant/userId context
  return (
    <div className="fade-in glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>My Expenses</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Track the status of your submitted claims</p>
        </div>
        <button onClick={onAddClick} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Expense
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'var(--bg-surface)' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid var(--border-color)' }}>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Merchant</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Amount</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row-hover">
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{new Date(exp.date).toLocaleDateString()}</td>
                <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {exp.vendor}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.id.slice(0, 8)}</div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{exp.category}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>₹{exp.amount.toFixed(2)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <StatusBadge status={exp.status} />
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {exp.status === 'PENDING' && (
                      <>
                        <button onClick={() => onEditClick(exp)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Edit</button>
                        <button onClick={() => handleDelete(exp.id)} style={{ background: 'transparent', border: '1px solid var(--status-red)', color: 'var(--status-red)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Delete</button>
                      </>
                    )}
                    {/* Demo intermediate approval for DEDICATED routing */}
                    {tenant?.routingStrategy === 'DEDICATED' && exp.status === 'PENDING' && (
                       <button onClick={async () => {
                         const t = localStorage.getItem('token');
                         await fetch(`${API_BASE}/api/v1/expenses/${exp.id}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'MANAGER_APPROVED' }) });
                         onRefresh();
                       }} style={{ background: 'transparent', border: '1px solid var(--status-amber)', color: 'var(--status-amber)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                         Manager Approve
                       </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <FileText size={48} color="var(--border-heavy)" />
                    <div>No expenses found. Submit a claim to get started.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinanceView({ expenses, tenant, onRefresh }: { expenses: any[], tenant: any, onRefresh: () => void }) {
  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE}/api/v1/expenses/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    onRefresh();
  };

  return (
    <div className="fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Finance Review Queue</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Approve, reject, or request clarification on team expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', color: 'var(--status-green)', borderColor: 'var(--status-green)' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <th style={{ padding: '12px' }}>ID & Vendor</th>
            <th style={{ padding: '12px' }}>Project/Dept</th>
            <th style={{ padding: '12px' }}>Details</th>
            <th style={{ padding: '12px' }}>Amount</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row-hover">
              <td style={{ padding: '14px 12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.vendor}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{exp.id.slice(0, 8)}</div>
              </td>
              <td style={{ padding: '14px 12px' }}>
                <div style={{ color: 'var(--text-primary)' }}>{exp.project || 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.department || 'N/A'}</div>
              </td>
              <td style={{ padding: '14px 12px' }}>
                <div style={{ color: 'var(--text-primary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.purpose || 'No purpose provided'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.category} • {new Date(exp.date).toLocaleDateString()}</div>
              </td>
              <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{exp.amount.toFixed(2)}</td>
              <td style={{ padding: '14px 12px' }}>
                 <StatusBadge status={exp.status} />
              </td>
              <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {(tenant?.routingStrategy === 'SHARED' && (exp.status === 'PENDING' || exp.status === 'FLAGGED')) || 
                   (tenant?.routingStrategy === 'DEDICATED' && (exp.status === 'MANAGER_APPROVED' || exp.status === 'FLAGGED')) ? (
                    <>
                      <button onClick={() => updateStatus(exp.id, 'APPROVED')} style={actionBtn('var(--status-green)')} title="Approve"><Check size={16} /></button>
                      <button onClick={() => updateStatus(exp.id, 'REJECTED')} style={actionBtn('var(--status-red)')} title="Reject"><X size={16} /></button>
                      <button onClick={() => updateStatus(exp.id, 'CLARIFICATION_NEEDED')} style={actionBtn('var(--accent-electric)')} title="Request Clarification"><MessageSquare size={16} /></button>
                    </>
                  ) : exp.status === 'APPROVED' ? (
                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--status-green)' }}>Reimburse</button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Action Required</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses pending review.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const actionBtn = (color: string) => ({
  background: 'white',
  border: `1px solid ${color}`,
  color: color,
  borderRadius: '6px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

function StatusBadge({ status }: { status: string }) {
  const base = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 };
  switch (status) {
    case 'APPROVED': return <span style={{ ...base, backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)' }}>Approved</span>;
    case 'PENDING': return <span style={{ ...base, backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>Pending Review</span>;
    case 'MANAGER_APPROVED': return <span style={{ ...base, backgroundColor: 'var(--status-amber-bg)', color: 'var(--status-amber)' }}>Mgr Approved</span>;
    case 'FLAGGED': return <span style={{ ...base, backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red)' }}>Policy Flag</span>;
    case 'REJECTED': return <span style={{ ...base, backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red)' }}>Rejected</span>;
    case 'CLARIFICATION_NEEDED': return <span style={{ ...base, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-electric)' }}>Clarify</span>;
    default: return <span style={{ ...base, backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{status}</span>;
  }
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  fontWeight: 500
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
};
