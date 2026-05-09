import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SavedAddresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  async function fetchAddresses() {
    setLoading(true);
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setAddresses(data);
    setLoading(false);
  }

  async function deleteAddress(id) {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } else {
      toast.error('Failed to remove address');
    }
  }

  return (
    <div className="page fade-in" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="top-header" style={{ background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f5f5f7', border: 'none', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Saved Addresses</h1>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20, background: '#eee' }} />)}
          </div>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>No Saved Addresses</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Add an address during checkout to see it here.</p>
            <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>Start Shopping</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {addresses.map(addr => (
              <div key={addr.id} style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: '6px 12px', background: 'rgba(0,110,36,0.1)', color: 'var(--primary)', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{addr.label || 'Address'}</div>
                    {addr.is_default && <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>• Default</span>}
                  </div>
                  <button 
                    onClick={() => deleteAddress(addr.id)}
                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{addr.full_name}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  {addr.address_line}<br />
                  {addr.landmark && `${addr.landmark}, `}{addr.city} - {addr.pincode}
                </div>
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {addr.phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
