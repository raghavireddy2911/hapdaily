'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  Milk,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState<{
    configured: boolean;
    missingItems: string[];
    connectivity: string;
    url: string;
  } | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Check Supabase configuration status on load
  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data) => {
        setStatusInfo(data);
        if (!data.configured) {
          setShowConfigGuide(true);
        }
      })
      .catch(() => {});

    // Check query params for expired session or error
    const errParam = searchParams.get('error');
    if (errParam === 'session_expired') {
      setError('Your owner session has expired. Please sign in again.');
    } else if (errParam === 'unauthorized_user') {
      setError('Access denied: this account is not registered as the store owner.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === 'SUPABASE_NOT_CONFIGURED') {
          setShowConfigGuide(true);
        }
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successful login via real Supabase
      const redirectPath = searchParams.get('redirect') || '/admin';
      window.location.href = redirectPath;
    } catch (err: any) {
      setError(
        err.message?.includes('Failed to fetch')
          ? 'Network error: could not connect to auth service. Please check your internet connection or Supabase settings.'
          : err.message || 'An error occurred during authentication.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg space-y-4"
      >
        {/* Header Icon */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-500/20 text-white">
            <Milk className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
            Authorized Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-2">
            Ayyappa Enterprises
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Hapdaily Store Owner Management Login
          </p>
        </div>

        {/* Supabase Configuration Warning Card (If not configured or failed to fetch) */}
        {statusInfo && !statusInfo.configured && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/90 border-2 border-amber-300/80 rounded-3xl p-5 text-xs text-amber-950 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm text-amber-900">
                  Supabase Project Credentials Required
                </p>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  The login failed with <strong>“Failed to fetch”</strong> because your{' '}
                  <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">
                    .env.local
                  </code>{' '}
                  is currently pointing to the dummy placeholder address (
                  <code className="font-mono text-amber-900">https://your-project.supabase.co</code>).
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-amber-200 space-y-2">
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>To connect your real Supabase account:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 leading-normal pl-1">
                <li>
                  Open your project dashboard at{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Go to <strong>Project Settings &gt; API</strong> and copy your{' '}
                  <strong>Project URL</strong> and <strong>anon / public key</strong>.
                </li>
                <li>
                  Go to <strong>Authentication &gt; Users</strong> and click{' '}
                  <strong>Add User</strong> to create your father's owner login.
                </li>
                <li>
                  Replace the dummy values in{' '}
                  <code className="font-mono bg-gray-100 px-1 rounded">hapdaily/.env.local</code>:
                </li>
              </ol>

              <div className="bg-gray-950 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
                NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1...<br />
                # (or NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...)
              </div>
            </div>
          </motion.div>
        )}

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Store Owner Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="father@ayyappa.com or owner@yourdomain.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Owner Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Supabase Auth password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-700 bg-red-50 p-3.5 rounded-2xl border border-red-200 leading-relaxed space-y-1"
              >
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Authentication Error:</span>
                </p>
                <p>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with Supabase Auth...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In as Store Owner</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real Supabase Auth</span>
            </span>
            <span>Server-side verification</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-sm font-bold text-gray-400">Loading owner portal...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
