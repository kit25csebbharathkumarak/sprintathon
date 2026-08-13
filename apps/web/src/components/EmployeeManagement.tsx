import { useState, useEffect } from 'react';
import { UserPlus, Settings, Search, Trash2 } from 'lucide-react';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const fetchEmployees = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/v1/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.error('API Error:', data);
          setEmployees([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (fullId: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/v1/employees/${fullId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchEmployees();
  };

  return (
    <div className="fade-in glass-panel" style={{ padding: '0', overflow: 'hidden' }}>

      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Employee Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage employee access, cost centers, and spending authorities</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search employees..."
              style={{ padding: '10px 10px 10px 40px', backgroundColor: '#f9fafb', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', width: '250px' }}
            />
          </div>
          <button onClick={() => { setEditingEmployee(null); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} /> Invite Employee
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px', backgroundColor: 'var(--bg-surface)' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid var(--border-color)' }}>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Employee</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Department</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Cost Center</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Manager</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Spending Limit</th>
              <th style={{ padding: '16px 24px', fontWeight: 600 }}>Approval Auth</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row-hover">
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.designation} • {emp.id}</div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{emp.dept}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{emp.location}</td>
                <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: 'var(--accent-electric)', fontWeight: 600 }}>{emp.costCenter}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{emp.manager}</td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.limit}</td>
                <td style={{ padding: '16px 24px' }}>
                  {emp.authority === 'No' ? (
                    <span style={{ color: 'var(--text-secondary)' }}>None</span>
                  ) : (
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {emp.authority}
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button onClick={() => { setEditingEmployee(emp); setShowModal(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} title="Settings">
                    <Settings size={18} />
                  </button>
                  <button onClick={() => handleDelete(emp.fullId)} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '4px', marginLeft: '12px' }} title="Delete Employee">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <UserPlus size={48} color="var(--border-heavy)" />
                    <div>No employees found. Invite an employee to get started.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <EmployeeModal employee={editingEmployee} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchEmployees(); }} />
      )}
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSaved }: { employee?: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.dept || 'Engineering',
    location: employee?.location || 'New York',
    costCenter: employee?.costCenter || 'CC-001',
    manager: employee?.manager || '',
    spendingLimit: employee?.limit || '₹5,000/mo',
    approvalAuth: employee?.authority || 'No',
    role: employee?.designation || 'EMPLOYEE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = employee ? `http://localhost:3001/api/v1/employees/${employee.fullId}` : 'http://localhost:3001/api/v1/employees/invite';
    const method = employee ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    onSaved();
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', marginTop: '4px' };
  const labelStyle = { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>{employee ? 'Edit Employee' : 'Invite Employee'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" required disabled={!!employee} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div>
              <label style={labelStyle}>Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Cost Center</label>
              <input type="text" value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Manager</label>
              <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Spending Limit</label>
              <input type="text" value={formData.spendingLimit} onChange={e => setFormData({...formData, spendingLimit: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Approval Authority</label>
              <select style={inputStyle} value={formData.approvalAuth} onChange={e => setFormData({...formData, approvalAuth: e.target.value})}>
                <option>No</option>
                <option>Up to ₹5k</option>
                <option>Up to ₹25k</option>
                <option>Unlimited</option>
              </select>
            </div>
          </div>

          <div>
             <label style={labelStyle}>Role</label>
              <select style={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>{employee ? 'Save Changes' : 'Send Invite'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
