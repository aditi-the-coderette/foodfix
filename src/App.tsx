/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { FoodFixMain } from './components/FoodFixMain';
import { getSupabaseConfig, getSupabaseClient } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyVersion, setKeyVersion] = useState(0); // Used to re-trigger state when browser variables change

  const { isConfigured } = getSupabaseConfig();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      setUser(null);
      return;
    }

    try {
      const supabase = getSupabaseClient();

      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((err) => {
        console.error('Error getting session', err);
        setLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to init Supabase in App.tsx', err);
      setLoading(false);
    }
  }, [isConfigured, keyVersion]);

  const handleConfigApplied = () => {
    // Re-verify configuration upon manual browser credential submission
    setKeyVersion((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    if (!isConfigured) {
      setUser(null);
      return;
    }
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="absolute text-orange-500 text-xs font-bold font-sans">FoodFix</span>
        </div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading your secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onConfigApplied={handleConfigApplied} onLogin={() => setKeyVersion(p => p + 1)} />;
  }

  return <FoodFixMain user={user} onSignOut={handleSignOut} />;
}
