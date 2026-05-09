import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { user, signInWithOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const redirectPath = searchParams.get('redirect');

  useEffect(() => {
    if (user) {
      navigate(redirectPath ? `/${redirectPath}` : '/');
    }
  }, [user]);

  async function handleSendOtp(e) {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Enter a valid 10-digit phone number');
    
    setLoading(true);
    try {
      // Clean up the phone number: remove non-digits, and if it starts with 91, remove it
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.slice(2);
      }
      
      const formatted = `+91${cleaned}`;
      console.log('Sending OTP to:', formatted);
      
      const { error } = await signInWithOtp(formatted);
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message || 'Failed to send OTP');
      } else {
        toast.success('OTP sent to your phone!');
        setStep('otp');
      }
    } catch (err) {
      console.error('Fatal error in handleSendOtp:', err);
      toast.error('An unexpected error occurred. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = cleaned.slice(2);
      }
      const formatted = `+91${cleaned}`;
      
      const { error } = await verifyOtp(formatted, otp);
      if (error) {
        toast.error('Invalid OTP. Please try again.');
      } else {
        toast.success('Welcome to Chandra Daily Mart! 🎉');
        navigate(redirectPath ? `/${redirectPath}` : '/');
      }
    } catch (err) {
      toast.error('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-lowest)' }}>
      {/* Top Green Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
        padding: '20px 20px 80px',
        borderRadius: '0 0 40px 40px',
        textAlign: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ fontSize: 56, marginBottom: 12, marginTop: 40 }}>🛒</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Chandra Daily Mart</h1>
        <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Fresh groceries delivered in 30 minutes</p>
      </div>

      {/* Form Card */}
      <div style={{
        background: 'var(--surface-lowest)',
        margin: '-30px 20px 0',
        borderRadius: 24,
        padding: '28px 24px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      }}>
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>Welcome Back 👋</h2>
            <p style={{ color: 'var(--outline)', fontSize: 13, marginBottom: 24 }}>Enter your phone number to continue</p>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'var(--surface-high)', borderRadius: 12, padding: '14px 12px', fontWeight: 600, fontSize: 15 }}>🇮🇳 +91</div>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <button type="button" onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
              ← Change Number
            </button>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>Verify OTP 🔐</h2>
            <p style={{ color: 'var(--outline)', fontSize: 13, marginBottom: 24 }}>Enter the 6-digit code sent to +91{phone.length > 10 ? phone.slice(-10) : phone}</p>

            <div className="input-group">
              <label className="input-label">OTP Code</label>
              <input
                className="input-field"
                type="number"
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                maxLength={6}
                required
                style={{ letterSpacing: '0.2em', fontSize: 22, fontWeight: 700, textAlign: 'center' }}
              />
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--outline)' }}>
              Didn't receive?{' '}
              <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Resend OTP
              </button>
            </p>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--outline)' }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
        {/* Hidden container for Firebase reCAPTCHA - kept for SDK compatibility but invisible */}
        <div id="recaptcha-container" style={{ visibility: 'hidden', position: 'absolute' }}></div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 100, color: 'var(--outline)', fontSize: 12 }}>
        📍 Delivering to Vinay Nagar, Faridabad
      </div>

    </div>
  );
}
