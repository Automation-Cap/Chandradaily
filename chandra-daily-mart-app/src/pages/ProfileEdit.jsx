import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const phoneDisplay = profile?.phone || user?.phone?.replace('+91', '') || '';

  async function handleSave() {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    const { error } = await updateProfile({ full_name: name.trim(), email: email.trim() });
    setSaving(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated! ✅');
      navigate('/profile');
    }
  }

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      {/* Header */}
      <div className="top-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/profile')} style={{
          background: 'var(--surface-container)', border: 'none', borderRadius: 10,
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{ fontSize: 20 }}>Edit Profile</h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {/* Avatar display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 34, fontWeight: 800,
            boxShadow: '0 6px 20px rgba(0,110,36,0.3)',
            marginBottom: 10,
          }}>
            {name?.[0]?.toUpperCase() || 'U'}
          </div>
          <p style={{ fontSize: 13, color: 'var(--outline)' }}>Your avatar is auto-generated</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--surface-lowest)', borderRadius: 22,
          padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: 'var(--on-surface-variant)' }}>
            Personal Information
          </h3>

          {/* Name */}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone (readonly) */}
          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', background: 'var(--surface-container)',
              borderRadius: 'var(--radius-md)', opacity: 0.8,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
                +91 {phoneDisplay}
              </span>
              <span style={{
                marginLeft: 'auto', background: 'var(--surface-high)', color: 'var(--outline)',
                fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 8px',
              }}>VERIFIED ✓</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 6 }}>
              Phone number cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Email Address</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email (optional)"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ borderRadius: 16, fontSize: 16, padding: '16px' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
