import { useState, useEffect } from 'react';
import { Building, Receipt, FileText, ExternalLink, Search, Plus, Trash2, Edit3 } from 'lucide-react';

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);

  const fetchVendors = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/v1/vendors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data);
        } else {
          setVendors([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3001/api/v1/vendors/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVendors();
  };

  return (
    <div className="fade-in glass-panel" style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Vendor Directory</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage enterprise and MSME vendors, compliance, and contracts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search vendors or GSTIN..." 
              style={{ padding: '10px 10px 10px 40px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', width: '280px' }} 
            />
          </div>
          <button onClick={() => { setEditingVendor(null); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Onboard Vendor
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>Vendor Details</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Payment Terms</th>
              <th style={{ padding: '12px' }}>Total Spend (YTD)</th>
              <th style={{ padding: '12px' }}>Contract Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }} className="table-row-hover">
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={18} color="var(--text-secondary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-electric)' }}>{vendor.gstin}</span>
                        <span>•</span>
                        <span>{vendor.contact}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 12px' }}>
                   <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                    {vendor.category}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', color: 'var(--text-primary)' }}>{vendor.terms}</td>
                <td style={{ padding: '16px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>{vendor.spend}</td>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: vendor.contract?.includes('Active') ? 'var(--status-green)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {vendor.contract?.includes('Active') && <FileText size={14} />}
                    {vendor.contract}
                  </div>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }} className="btn-secondary">
                      <Receipt size={14} /> {vendor.invoices} <ExternalLink size={12} />
                    </button>
                    <button onClick={() => { setEditingVendor(vendor); setShowModal(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit Vendor">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(vendor.id)} style={{ background: 'transparent', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: '4px' }} title="Delete Vendor">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No vendors found. Submit an expense to automatically track a vendor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <VendorModal vendor={editingVendor} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchVendors(); }} />
      )}
    </div>
  );
}

function VendorModal({ vendor, onClose, onSaved }: { vendor?: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    gstin: vendor?.gstin || '',
    contact: vendor?.contact || '',
    category: vendor?.category || 'Software Licenses',
    terms: vendor?.terms || 'Net 30',
    spend: vendor?.spend || '₹0',
    contract: vendor?.contract || 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = vendor ? `http://localhost:3001/api/v1/vendors/${vendor.id}` : 'http://localhost:3001/api/v1/vendors';
    const method = vendor ? 'PUT' : 'POST';

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
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>{vendor ? 'Edit Vendor' : 'Onboard Vendor'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Vendor Name *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div>
              <label style={labelStyle}>GSTIN / Tax ID</label>
              <input type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contact Email</label>
              <input type="email" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Software Licenses</option>
                <option>Infrastructure</option>
                <option>Travel Agency</option>
                <option>Office Supplies</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment Terms</label>
              <select style={inputStyle} value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})}>
                <option>Due on Receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 60</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Contract Status</label>
              <input type="text" value={formData.contract} onChange={e => setFormData({...formData, contract: e.target.value})} style={inputStyle} placeholder="e.g. Active (Expires 2026)" />
            </div>
            <div>
              <label style={labelStyle}>Total Spend</label>
              <input type="text" value={formData.spend} onChange={e => setFormData({...formData, spend: e.target.value})} style={inputStyle} placeholder="e.g. ₹1,20,000" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>{vendor ? 'Save Changes' : 'Onboard Vendor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
