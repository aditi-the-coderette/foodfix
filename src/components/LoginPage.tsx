import React, { useState, useEffect } from 'react';
import { getSupabaseConfig, getSupabaseClient, resetSupabaseClient } from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Server, 
  Key, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onConfigApplied: () => void;
}

export const LoginPage = ({ onLogin, onConfigApplied }: LoginPageProps) => {
  // Configuration State
  const { isConfigured, url: initialUrl, anonKey: initialKey } = getSupabaseConfig();
  const [tempUrl, setTempUrl] = useState(initialUrl);
  const [tempKey, setTempKey] = useState(initialKey);
  const [configError, setConfigError] = useState<string | null>(null);

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interaction State
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Auto-fill temp fields if they are saved in localStorage
  useEffect(() => {
    const localUrl = localStorage.getItem('supabase_temp_url');
    const localKey = localStorage.getItem('supabase_temp_key');
    if (localUrl) setTempUrl(localUrl);
    if (localKey) setTempKey(localKey);
  }, []);

  // Save manual configurations to localStorage
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);

    const trimmedUrl = tempUrl.trim();
    const trimmedKey = tempKey.trim();

    if (!trimmedUrl || !trimmedKey) {
      setConfigError('Both Supabase URL and Anon Api Key are required.');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setConfigError('The Supabase URL must start with https:// or http://');
      return;
    }

    localStorage.setItem('supabase_temp_url', trimmedUrl);
    localStorage.setItem('supabase_temp_key', trimmedKey);
    
    // Reset client to reinitialise with new credentials
    resetSupabaseClient();
    
    // Trigger parent app state refresh
    onConfigApplied();
  };

  const handleClearConfig = () => {
    localStorage.removeItem('supabase_temp_url');
    localStorage.removeItem('supabase_temp_key');
    setTempUrl('');
    setTempKey('');
    resetSupabaseClient();
    onConfigApplied();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Please fill in all email and password fields.' });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (isSignUp && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        // Check if session was auto-started (email confirmation disabled in Supabase)
        if (data?.session) {
          setMessage({
            type: 'success',
            text: 'Account created successfully! Logging you in...',
          });
          setTimeout(() => {
            onLogin();
          }, 1500);
        } else {
          setMessage({
            type: 'success',
            text: 'Registration successful! Please check your email to verify your account.',
          });
          // Reset form fields
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Welcome back! Redirecting...',
        });
        
        setTimeout(() => {
          onLogin();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Supabase authentication error:', err);
      
      let errorMessage = err?.message || 'Failed to authenticate. Please check your credentials.';
      
      // Provide enhanced actionable advice if they run into email confirmation limits
      if (errorMessage.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'Email not confirmed yet. Please check your email inbox (and spam folder) for the confirmation link, or disable "Confirm email" in your Supabase Auth settings to allow instant log in.';
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-orange-100 selection:text-orange-950">
      
      {/* Container Card */}
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden p-8">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-orange-50 font-bold text-orange-500 rounded-2xl py-3 px-5 mb-3 select-none">
            <span className="text-2xl mr-1">🍔</span>
            <span className="text-2xl font-bold font-sans tracking-tight">Food<span className="text-slate-800">Fix</span></span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Polished Food Delivery & Smart Customer Support Hub</p>
        </div>

        {/* Dedicated Auth Form */}
        <div className="space-y-6">
          
          {/* Tab Swapping Header */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              type="button"
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl pl-4 pr-11 py-3 text-sm text-slate-800 outline-none transition animate-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Confirm Password
                </label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password..."
                  className="w-full border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none transition"
                />
              </div>
            )}

            {/* Status Indicator Messages */}
            {message && (
              <div className={`flex gap-2.5 items-start text-xs rounded-xl p-3 border transition ${
                message.type === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-700' 
                  : 'bg-green-50 border-green-100 text-green-700'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 enabled:active:scale-[0.99] text-white py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-md shadow-orange-500/10 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Secure Account' : 'Sign In To FoodFix'}
                  <Zap className="w-4 h-4 fill-white animate-pulse" />
                </>
              )}
            </button>
          </form>

          {/* Clean security info to emphasize production layout */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[11px] text-slate-400 select-none">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Secure Database Vault
            </span>
            <span className="font-semibold text-slate-400">
              Supabase Auth v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
