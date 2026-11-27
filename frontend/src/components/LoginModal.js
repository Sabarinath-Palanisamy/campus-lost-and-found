import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, User as UserIcon, Lock, KeyRound, Mail } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth } from '../services/firebase';
import { useAppState } from '../context/AppState';

export default function LoginModal({ onClose, isSignup }) {
  const { auth } = useAppState();
  
  const [isSignupMode, setIsSignupMode] = useState(isSignup);
  const [mode, setMode] = useState(isSignup ? 'signup' : 'login-pwd');
  const [countryCode, setCountryCode] = useState('+91');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', otp: '' });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Formats local digits into E.164 (e.g., "+919876543210") required by Firebase
  const getFormattedPhone = () => {
    const cleaned = formData.phone.replace(/\D/g, '');
    return formData.phone.startsWith('+') ? formData.phone : `${countryCode}${cleaned}`;
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
    return recaptchaVerifierRef.current;
  };

  const sendFirebaseOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const appVerifier = setupRecaptcha();
      const formattedPhone = getFormattedPhone();
      const confirmation = await signInWithPhoneNumber(firebaseAuth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (err) {
      console.error('Firebase OTP Error:', err);
      setError(err.message || 'Failed to send OTP. Check phone number format.');
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (endpoint, payload) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8080/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Authentication failed');
      }
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP STEP 1: Trigger real SMS OTP before moving to verification screen
  const submitSignupDetails = async (e) => {
    e.preventDefault();
    const sent = await sendFirebaseOtp();
    if (sent) {
      setMode('signup-otp-ver');
    }
  };

  // SIGNUP STEP 2: Confirm OTP with Firebase, then pass signed idToken to Spring Boot
  const submitSignupVerify = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return setError('Session expired. Please request OTP again.');

    setIsLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(formData.otp);
      const idToken = await result.user.getIdToken();

      const user = await handleAuth('signup', {
        name: formData.name,
        phone: getFormattedPhone(),
        email: formData.email,
        password: formData.password,
        idToken
      });

      if (user) {
        auth.login(user);
        onClose();
      }
    } catch (err) {
      setError('Invalid or expired OTP.');
      setIsLoading(false);
    }
  };

  const submitPasswordLogin = async (e) => {
    e.preventDefault();
    const user = await handleAuth('login-password', { 
      phone: getFormattedPhone(), 
      password: formData.password 
    });
    if (user) { auth.login(user); onClose(); }
  };

  const submitOtpRequest = async (e) => {
    e.preventDefault();
    const sent = await sendFirebaseOtp();
    if (sent) setMode('login-otp-ver');
  };

  const submitOtpVerify = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return setError('Session expired. Please request OTP again.');

    setIsLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(formData.otp);
      const idToken = await result.user.getIdToken();

      const user = await handleAuth('verify-otp', {
        phone: getFormattedPhone(),
        idToken
      });

      if (user) {
        auth.login(user);
        onClose();
      }
    } catch (err) {
      setError('Invalid or expired OTP.');
      setIsLoading(false);
    }
  };

  const renderPhoneInput = (placeholder = 'Phone Number') => (
    <div className="flex gap-2">
      <select
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
        className="px-2 py-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:border-blue-500"
      >
        <option value="+91">+91</option>
        <option value="+49">+49</option>
        <option value="+1">+1</option>
      </select>
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          required
          type="tel"
          placeholder={placeholder}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X size={20} />
        </button>

        {/* Invisible reCAPTCHA mount point */}
        <div id="recaptcha-container"></div>

        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode(isSignupMode ? 'signup' : 'login-pwd')}
            className="flex-1 py-4 text-sm font-bold transition text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-800"
          >
            {isSignupMode ? 'Sign Up' : 'Login'}
          </button>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

          {mode === 'signup' && (
            <form onSubmit={submitSignupDetails} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              {renderPhoneInput('Phone Number')}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="password" placeholder="Create Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
              <div className="text-center mt-4">
                <span className="text-sm text-slate-500">Already a user? </span>
                <button type="button" onClick={() => { setMode('login-pwd'); setIsSignupMode(false); }} className="text-sm font-semibold text-blue-600 hover:underline">
                  Click here to login
                </button>
              </div>
            </form>
          )}

          {mode === 'signup-otp-ver' && (
            <form onSubmit={submitSignupVerify} className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-4">
                Enter the 6-digit verification code sent to <br /><span className="font-bold">{getFormattedPhone()}</span>
              </p>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="text" maxLength="6" placeholder="6-digit OTP" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-center tracking-widest font-mono text-lg outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Creating Account...' : 'Verify & Create Account'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setMode('signup')} className="text-sm font-semibold text-slate-500 hover:text-blue-600">
                  Back to Details
                </button>
              </div>
            </form>
          )}

          {mode === 'login-pwd' && (
            <form onSubmit={submitPasswordLogin} className="space-y-4">
              {renderPhoneInput('Phone Number')}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>
              <div className="text-center mt-4 flex flex-col gap-2">
                <button type="button" onClick={() => setMode('login-otp-req')} className="text-sm font-semibold text-slate-500 hover:text-blue-600">
                  Login with OTP instead
                </button>
                <div>
                  <span className="text-sm text-slate-500">Don't have an account? </span>
                  <button type="button" onClick={() => { setMode('signup'); setIsSignupMode(true); }} className="text-sm font-semibold text-blue-600 hover:underline">
                    Click here to Signup
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === 'login-otp-req' && (
            <form onSubmit={submitOtpRequest} className="space-y-4">
              {renderPhoneInput('Registered Phone Number')}
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Sending Code...' : 'Send OTP'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setMode('login-pwd')} className="text-sm font-semibold text-slate-500 hover:text-blue-600">
                  Back to Password Login
                </button>
              </div>
            </form>
          )}

          {mode === 'login-otp-ver' && (
            <form onSubmit={submitOtpVerify} className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-4">
                Enter the 6-digit verification code sent to <br /><span className="font-bold">{getFormattedPhone()}</span>
              </p>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="text" maxLength="6" placeholder="6-digit OTP" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-center tracking-widest font-mono text-lg outline-none focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}