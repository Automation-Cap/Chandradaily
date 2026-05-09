import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import toast from 'react-hot-toast';

export default function TopHeader() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading } = useAuth();
  const { isOpen } = useStore();
  const [locationStr, setLocationStr] = useState('Fetching location...');

  const fetchLocation = useCallback(async () => {
    if ('geolocation' in navigator) {
      setLocationStr('Locating...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            
            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Faridabad';
            const area = data.address.suburb || data.address.neighbourhood || data.address.residential || 'Vinay Nagar';
            
            setLocationStr(`${area}, ${city}`);
            if (window.location.pathname === '/') toast.success(`Location set to ${area}`);
          } catch (err) {
            setLocationStr('Vinay Nagar, Faridabad');
          }
        },
        (error) => {
          setLocationStr('Vinay Nagar, Faridabad');
        }
      );
    } else {
      setLocationStr('Vinay Nagar, Faridabad');
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleLocationClick = () => {
    if (user) {
      navigate('/profile/addresses');
    } else {
      fetchLocation();
    }
  };

  return (
    <div className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div 
          onClick={() => navigate('/')}
          style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
          G
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span 
                onClick={() => navigate('/')}
                style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px', cursor: 'pointer' }}>Chandra Daily Mart</span>
              {isAdmin && <span className="admin-badge" onClick={() => navigate('/admin')} style={{ fontSize: 9, cursor: 'pointer' }}>ADMIN</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', marginTop: -2 }}>Delivery in 30 mins</h1>
              {!isOpen && (
                <span style={{ 
                  fontSize: 10, 
                  fontWeight: 800, 
                  background: '#FF3B30', 
                  color: 'white', 
                  padding: '1px 6px', 
                  borderRadius: 4,
                  textTransform: 'uppercase'
                }}>Closed</span>
              )}
            </div>
          </div>
          <p 
            onClick={handleLocationClick}
            style={{ fontSize: 12, color: 'var(--outline)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationStr}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {loading ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container-low)', animation: 'pulse 1.5s infinite ease-in-out' }} />
        ) : !user ? (
          <button onClick={() => navigate('/login')} style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>
            Login
          </button>
        ) : (
          <div onClick={() => navigate('/profile')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--on-surface-variant)', cursor: 'pointer', border: '1px solid var(--outline-variant)' }}>
            {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </div>
  );
}
