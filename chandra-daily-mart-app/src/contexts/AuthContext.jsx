import { createContext, useContext, useEffect, useState } from 'react';
import { auth, messaging } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { supabase, ADMIN_PHONE } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  // Enable reCAPTCHA bypass for testing
  // This allows you to use Test Phone Numbers (+919999900000) without the captcha popup
  // Bypass reCAPTCHA for testing - set to true if user wants to bypass always during dev/test
  auth.settings.appVerificationDisabledForTesting = true;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Add id alias for backward compatibility with user.id usage
          const enhancedUser = { ...firebaseUser, id: firebaseUser.uid };
          setUser(enhancedUser);
          
          // Wait for profile to load before ending loading state
          await fetchProfile(firebaseUser.uid);
          
          // Request FCM token if supported
          if (messaging) {
            try {
              const token = await getToken(messaging, { 
                vapidKey: 'N4tuZsphqImt0ajnFLjUMRcDHhO8tl1Ix7DCxzXLXYI'
              });
              if (token) console.log('FCM Token:', token);
            } catch (err) {
              console.log('FCM Error:', err);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    if (!uid) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ 
          id: uid, 
          phone: auth.currentUser?.phoneNumber || '',
          full_name: '',
          wallet_balance: 0
        })
        .select()
        .single();
      if (newProfile) setProfile(newProfile);
      return newProfile;
    }
    
    if (data) setProfile(data);
    return data || null;
  }

  async function updateProfile(updates) {
    if (!user) return { error: new Error('Not logged in') };
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.uid, ...updates })
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data: data || null, error };
  }

  async function signInWithOtp(phone) {
    console.log('signInWithOtp called for:', phone);
    try {
      // Create Recaptcha verifier if not already present
      if (!window.recaptchaVerifier) {
        console.log('Initializing RecaptchaVerifier...');
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }
      
      console.log('Calling signInWithPhoneNumber...');
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      console.log('signInWithPhoneNumber success');
      setConfirmationResult(result);
      return { data: result, error: null };
    } catch (error) {
      console.error('Firebase SMS error details:', error);
      
      // Reset verifier so next attempt starts fresh
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing verifier:', e);
        }
        window.recaptchaVerifier = null;
      }

      let message = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/captcha-check-failed') message = 'reCAPTCHA verification failed.';
      if (error.code === 'auth/invalid-phone-number') message = 'Invalid phone number format.';
      if (error.code === 'auth/quota-exceeded') message = 'SMS quota exceeded. Use a test number (+919999900000).';
      if (error.code === 'auth/too-many-requests') message = 'Too many requests. Please wait.';
      
      return { data: null, error: { ...error, message } };
    }
  }

  async function verifyOtp(phone, token) {
    if (!confirmationResult) return { error: new Error('No confirmation result found') };
    try {
      const result = await confirmationResult.confirm(token);
      const firebaseUser = result.user;
      setUser(firebaseUser);
      await fetchProfile(firebaseUser.uid);
      return { data: { user: firebaseUser }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async function signOut() {
    setUser(null);
    setProfile(null);
    await firebaseSignOut(auth);
  }

  // Detailed logging for admin check
  const adminNumbers = ['9625138761', '962513871'];
  const isAdmin = (
    adminNumbers.some(num => profile?.phone?.includes(num)) || 
    adminNumbers.some(num => user?.phoneNumber?.includes(num))
  ) === true;
  
  if (user) {
    console.log('Admin check for:', user.phoneNumber, 'Profile:', profile?.phone, 'Result:', isAdmin);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      signInWithOtp, 
      verifyOtp, 
      signOut, 
      updateProfile, 
      refreshProfile: () => fetchProfile(user?.uid) 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
