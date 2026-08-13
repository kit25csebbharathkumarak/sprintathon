import { useState, useEffect } from 'react';
import { Shield, Plus, AlertCircle, Edit3, Settings2, Trash2 } from 'lucide-react';

export default function PolicyEngine() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);

  const fetchPolicies = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/v1/policies', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPolicies(data);
        } else {
          console.error('API Error:', data);
          setPolicies([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/v1/policies/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPolicies();
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/v1/policies/${id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active: currentStatus !== 'Active' })
    });
    fetchPolicies();
  };

  return (
    <div className="fade-in">
      
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Left Col: Policies List */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Active Expense Policies</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Define rules that auto-approve, block, or flag expenses</p>
            </div>
            <button onClick={() => { setEditingPolicy(null); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Create New Policy
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {policies.map((policy) => (
              <div key={policy.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }} className="table-row-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'rgba(0, 120, 212, 0.1)', borderRadius: '12px' }}>
                      <Shield size={24} color="var(--accent-electric)" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{policy.name}</h4>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em' }}>
                          {policy.type}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px', margin: '6px 0 0 0' }}>{policy.description}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '0.85rem', color: policy.severity === 'Hard Block' ? 'var(--status-red)' : 'var(--status-amber)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, backgroundColor: policy.severity === 'Hard Block' ? 'var(--status-red-bg)' : 'var(--status-amber-bg)', padding: '6px 12px', borderRadius: '8px' }}>
                      <AlertCircle size={16} /> {policy.severity}
                    </div>
                    {/* Toggle Switch */}
                    <div onClick={() => handleToggle(policy.id, policy.status)} style={{ width: '44px', height: '24px', backgroundColor: policy.status === 'Active' ? 'var(--status-green)' : 'var(--border-heavy)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: policy.status === 'Active' ? '22px' : '2px', transition: 'all 0.2s' }}></div>
                    </div>
                    <button onClick={() => { setEditingPolicy(policy); setShowModal(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', marginLeft: '8px' }} title="Edit Policy" onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit3 size={20} />
                    </button>
                    <button onClick={() => handleDelete(policy.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', marginLeft: '4px' }} title="Delete Policy" onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-red)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {policies.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Shield size={48} color="var(--border-heavy)" />
                  <div>No active policies. Create one to get started.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <Settings2 size={20} color="var(--accent-electric)" /> Global Policy Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>Auto-Approve Under</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount threshold</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--status-green)', fontWeight: 600, padding: '6px 12px', backgroundColor: 'var(--status-green-bg)', borderRadius: '6px' }}>
                  ₹25.00
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>Global Default Limit</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monthly spend per employee</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent-electric)', fontWeight: 600, padding: '6px 12px', backgroundColor: 'rgba(0, 120, 212, 0.1)', borderRadius: '6px' }}>
                  ₹2,500
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>Approval Routing</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Default hierarchy</div>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Manager <Edit3 size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'rgba(0, 120, 212, 0.03)', border: '1px solid rgba(0, 120, 212, 0.15)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-electric)', marginBottom: '12px' }}>Policy Impact</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              In the last 30 days, your active policies have automatically flagged <strong>42</strong> expenses, saving an estimated <strong>₹4,200</strong> in non-compliant spend.
            </p>
            <button className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', color: 'var(--accent-electric)', borderColor: 'var(--accent-electric)', fontWeight: 600 }}>
              View Impact Report
            </button>
          </div>

        </div>
      </div>
      
      {showModal && (
        <PolicyModal policy={editingPolicy} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchPolicies(); }} />
      )}
    </div>
  );
}

function PolicyModal({ policy, onClose, onSaved }: { policy?: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    category: policy?.category || 'All',
    maxAmount: policy?.maxAmount || policy?.description?.replace(/[^0-9.]/g, '') || '', // Extract if mocked
    type: policy?.type || 'Expense Limit',
    description: policy?.description || '',
    severity: policy?.severity || 'Hard Block'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = policy ? `http://localhost:3001/api/v1/policies/${policy.id}` : 'http://localhost:3001/api/v1/policies';
    const method = policy ? 'PUT' : 'POST';

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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>{policy ? 'Edit Policy' : 'Create New Policy'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Policy Name *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} placeholder="e.g. Flight Booking Limit" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Expense Limit</option>
                <option>Restricted Vendor</option>
                <option>Weekend Spend</option>
                <option>Receipt Requirement</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>All</option>
                <option>Travel & Flights</option>
                <option>Meals & Ent.</option>
                <option>Software Licenses</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Max Amount (₹)</label>
              <input type="number" step="0.01" value={formData.maxAmount} onChange={e => setFormData({...formData, maxAmount: e.target.value})} style={inputStyle} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <select style={inputStyle} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option>Hard Block</option>
                <option>Flag for Review</option>
                <option>Warn User</option>
              </select>
            </div>
          </div>

          <div>
             <label style={labelStyle}>Description</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, resize: 'none' }} placeholder="Explain the policy purpose..."></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>{policy ? 'Save Changes' : 'Create Policy'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
