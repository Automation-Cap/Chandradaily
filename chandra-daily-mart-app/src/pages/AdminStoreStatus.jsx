import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminStoreStatus() {
  const navigate = useNavigate();
  const { 
    isOpen, 
    deliveryRadius, 
    morningDeliveryEnabled, 
    morningCutoff, 
    minOrderValue, 
    deliveryCharge,
    handlingCharge,
    openingTime,
    closingTime,
    isAutoScheduleEnabled,
    isDeliveryChargeEnabled,
    isHandlingChargeEnabled,
    isCurrentlyOpen,
    updateSettings, 
    loading 
  } = useStore();
  const { isAdmin, loading: authLoading } = useAuth();

  // Local state for smooth UI interaction before saving
  const [localRadius, setLocalRadius] = useState(deliveryRadius);
  const [localCutoff, setLocalCutoff] = useState(morningCutoff);
  const [localMinOrder, setLocalMinOrder] = useState(minOrderValue);
  const [localDelivery, setLocalDelivery] = useState(deliveryCharge);
  const [localHandling, setLocalHandling] = useState(handlingCharge);
  const [localOpening, setLocalOpening] = useState(openingTime);
  const [localClosing, setLocalClosing] = useState(closingTime);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Unauthorized');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!loading) {
      setLocalRadius(deliveryRadius);
      setLocalCutoff(morningCutoff);
      setLocalMinOrder(minOrderValue);
      setLocalDelivery(deliveryCharge);
      setLocalHandling(handlingCharge);
      setLocalOpening(openingTime);
      setLocalClosing(closingTime);
    }
  }, [loading, deliveryRadius, morningCutoff, minOrderValue, deliveryCharge, handlingCharge, openingTime, closingTime]);

  if (authLoading || loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#666', fontWeight: 600 }}>Loading Operational Hub...</p>
      </div>
    </div>
  );

  if (!isAdmin) return null;

  const saveSetting = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      toast.success('Settings Saved');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const Toggle = ({ label, sublabel, isOn, onToggle }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{label}</h4>
        {sublabel && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>{sublabel}</p>}
      </div>
      <div 
        onClick={onToggle}
        style={{
          width: 52,
          height: 32,
          borderRadius: 16,
          background: isOn ? '#34C759' : '#e0e0e0',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          background: 'white',
          position: 'absolute',
          top: 3,
          left: isOn ? 23 : 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }} />
      </div>
    </div>
  );

  return (
    <div className="page fade-in" style={{ 
      background: '#fcfcfd',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 40
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate('/admin')} style={{ background: '#f5f5f7', border: 'none', borderRadius: 12, padding: 8, cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Operational Hub</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>
        
        {/* Store Status Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: 24, 
          marginBottom: 20, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: isCurrentlyOpen ? '#34C75915' : '#FF3B3015',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40
            }}>
              {isCurrentlyOpen ? '🏪' : '🔒'}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>
              Store is {isCurrentlyOpen ? 'OPEN' : 'CLOSED'}
            </h2>
            <p style={{ color: '#666', fontSize: 13 }}>
              {isCurrentlyOpen ? 'Customers can place orders now.' : 'Store is currently not accepting orders.'}
            </p>
          </div>

          <Toggle 
            label="Master Online Status" 
            sublabel="Force close the store manually"
            isOn={isOpen} 
            onToggle={() => saveSetting('isOpen', !isOpen)} 
          />
          
          <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />

          <Toggle 
            label="Auto Scheduling" 
            sublabel="Open/Close based on business hours"
            isOn={isAutoScheduleEnabled} 
            onToggle={() => saveSetting('isAutoScheduleEnabled', !isAutoScheduleEnabled)} 
          />

          {isAutoScheduleEnabled && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 }}>Opening Time</label>
                <input 
                  type="time" 
                  value={localOpening}
                  onChange={(e) => setLocalOpening(e.target.value)}
                  onBlur={() => saveSetting('openingTime', localOpening)}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 14, background: '#fcfcfd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 }}>Closing Time</label>
                <input 
                  type="time" 
                  value={localClosing}
                  onChange={(e) => setLocalClosing(e.target.value)}
                  onBlur={() => saveSetting('closingTime', localClosing)}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 14, background: '#fcfcfd' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Morning Delivery Card */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <Toggle 
            label="Morning Delivery Service" 
            sublabel="7 AM milk, bread & eggs delivery"
            isOn={morningDeliveryEnabled} 
            onToggle={() => saveSetting('morningDeliveryEnabled', !morningDeliveryEnabled)} 
          />

          {morningDeliveryEnabled && (
            <div className="fade-in" style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 }}>Order Cutoff (Previous Night)</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="time" 
                  value={localCutoff}
                  onChange={(e) => setLocalCutoff(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
                />
                <button onClick={() => saveSetting('morningCutoff', localCutoff)} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Logistics & Pricing */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Logistics & Pricing</h3>
          
          {/* Handling Charge Section */}
          <div style={{ marginBottom: 24 }}>
            <Toggle 
              label="Enable Handling Charge" 
              isOn={isHandlingChargeEnabled} 
              onToggle={() => saveSetting('isHandlingChargeEnabled', !isHandlingChargeEnabled)} 
            />
            {isHandlingChargeEnabled && (
              <div className="fade-in" style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <input 
                  type="number" 
                  value={localHandling}
                  onChange={(e) => setLocalHandling(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
                />
                <button onClick={() => saveSetting('handlingCharge', parseFloat(localHandling))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
              </div>
            )}
          </div>

          {/* Delivery Charge Section */}
          <div style={{ marginBottom: 24 }}>
            <Toggle 
              label="Enable Delivery Charge" 
              isOn={isDeliveryChargeEnabled} 
              onToggle={() => saveSetting('isDeliveryChargeEnabled', !isDeliveryChargeEnabled)} 
            />
            {isDeliveryChargeEnabled && (
              <div className="fade-in" style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <input 
                  type="number" 
                  value={localDelivery}
                  onChange={(e) => setLocalDelivery(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
                />
                <button onClick={() => saveSetting('deliveryCharge', parseFloat(localDelivery))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
              </div>
            )}
          </div>

          {/* Min Order Section */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Minimum Order Value (₹)</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="number" 
                value={localMinOrder}
                onChange={(e) => setLocalMinOrder(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
              />
              <button onClick={() => saveSetting('minOrderValue', parseFloat(localMinOrder))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
            </div>
          </div>

          {/* Radius Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Delivery Radius</h4>
              <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{localRadius} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="20" step="0.5"
              value={localRadius}
              onChange={(e) => setLocalRadius(parseFloat(e.target.value))}
              onMouseUp={() => saveSetting('deliveryRadius', localRadius)}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24 }}>
          Live settings for Chandra Daily Mart operations.
        </p>
      </div>
    </div>
  );
}
