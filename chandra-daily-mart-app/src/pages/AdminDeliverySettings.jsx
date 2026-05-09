import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDeliverySettings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    deliveryRadius, 
    morningDeliveryEnabled, 
    morningCutoff, 
    minOrderValue, 
    deliveryCharge,
    updateSettings 
  } = useStore();

  const [localRadius, setLocalRadius] = useState(deliveryRadius);
  const [localMinOrder, setLocalMinOrder] = useState(minOrderValue);
  const [localCharge, setLocalCharge] = useState(deliveryCharge);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    setLocalRadius(deliveryRadius);
    setLocalMinOrder(minOrderValue);
    setLocalCharge(deliveryCharge);
  }, [deliveryRadius, minOrderValue, deliveryCharge]);

  const handleSave = async (field, value) => {
    await updateSettings({ [field]: value });
    toast.success('Setting updated!');
  };

  if (!isAdmin) return null;

  return (
    <div className="page fade-in" style={{ 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      paddingBottom: 40
    }}>
      <div className="top-header" style={{ background: 'white', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#333', margin: 0 }}>Delivery Settings</h1>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* Delivery Radius */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FF950015', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Delivery Radius</h3>
          </div>

          <div style={{ background: '#f0f0f0', borderRadius: 16, height: 160, marginBottom: 20, overflow: 'hidden', position: 'relative' }}>
             <img 
               src="https://nominatim.openstreetmap.org/reverse?format=json&lat=28.4089&lon=77.3178" 
               alt="Map placeholder" 
               style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'grayscale(1)' }}
             />
             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  width: localRadius * 20, 
                  height: localRadius * 20, 
                  borderRadius: '50%', 
                  background: 'rgba(0, 110, 36, 0.1)', 
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }} />
                </div>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Coverage Area</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{localRadius.toFixed(1)} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            step="0.5" 
            value={localRadius} 
            onChange={(e) => setLocalRadius(parseFloat(e.target.value))}
            onMouseUp={() => handleSave('deliveryRadius', localRadius)}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Morning Delivery */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFD60A15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>☀️</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Morning Delivery</h3>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Early morning slots availability</p>
              </div>
            </div>
            <button 
              onClick={() => handleSave('morningDeliveryEnabled', !morningDeliveryEnabled)}
              style={{
                width: 50,
                height: 28,
                borderRadius: 14,
                background: morningDeliveryEnabled ? 'var(--primary)' : '#ddd',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 2,
                left: morningDeliveryEnabled ? 24 : 2,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8f9fa', borderRadius: 16 }}>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>Order Cutoff Time</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="time" 
                value={morningCutoff} 
                onChange={(e) => updateSettings({ morningCutoff: e.target.value })}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: 14, color: '#333', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 10, background: '#eee', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Next Day</span>
            </div>
          </div>
        </div>

        {/* Order Values */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#34C75915', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💰</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pricing & Thresholds</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#666', fontWeight: 600, display: 'block', marginBottom: 8 }}>Minimum Order Value (₹)</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="number" 
                  value={localMinOrder} 
                  onChange={(e) => setLocalMinOrder(parseInt(e.target.value))}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #eee', fontSize: 15, fontWeight: 700 }}
                />
                <button 
                  onClick={() => handleSave('minOrderValue', localMinOrder)}
                  style={{ padding: '0 16px', borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14 }}
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: '#666', fontWeight: 600, display: 'block', marginBottom: 8 }}>Delivery Charge (₹)</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="number" 
                  value={localCharge} 
                  onChange={(e) => setLocalCharge(parseInt(e.target.value))}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #eee', fontSize: 15, fontWeight: 700 }}
                />
                <button 
                  onClick={() => handleSave('deliveryCharge', localCharge)}
                  style={{ padding: '0 16px', borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14 }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
