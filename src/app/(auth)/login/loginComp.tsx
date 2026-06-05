'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { login, UserRole } from '@/libs/api/auth';
import { useAuthStore, Profile, OwnerProfile, ClinicProfile, VetProfile } from '@/store/auth';

function decodeToken(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

export default function LoginComp() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const router     = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const roles: UserRole[] = ['owner', 'clinic', 'vet'];
    let data: Awaited<ReturnType<typeof login>> | null = null;

    for (const role of roles) {
      try {
        data = await login(role, { email, password });
        break;
      } catch {
        // try next role
      }
    }

    if (!data) {
      setLoading(false);
      setError('Invalid email or password');
      toast.error('Login failed');
      return;
    }

    try {
      const decoded = decodeToken(data.token);
      const userId  = (decoded.userId as string) ?? '';
      let profile: Profile;

      if (data.role === 'owner') {
        const ownerProfile: OwnerProfile = {
          id: userId, fullname: null, email, phoneNumber: '',
          address: { country: null, city: null, street: null, zipCode: null },
          pets: [], type: 'owner',
        };
        profile = ownerProfile;
      } else if (data.role === 'clinic') {
        const clinicProfile: ClinicProfile = {
          id: userId, clinicName: null, email, phone: '',
          address: { country: null, city: null, street: null, state: null, zipCode: null },
          vets: [], servicesProvided: [], pricing: [], type: 'clinic',
        };
        profile = clinicProfile;
      } else {
        const vetProfile: VetProfile = {
          id: userId, fullname: null, email, phone: '', clinicId: '', type: 'vet',
        };
        profile = vetProfile;
      }

      setProfile(profile, data.token);
      localStorage.setItem('role', data.role);
      if (remember) localStorage.setItem('remember', '1');

      toast.success(`Logged in as ${data.role}!`);
      router.push('/role-gate');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Login failed');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <main className="min-h-screen flex items-center justify-center pry-ff" style={{ backgroundColor: 'var(--bg-clr)' }}>
        <div className="w-full max-w-[400px] bg--pry-clr rounded-2xl shadow-lg p-8 mx-4">

          {/* Heading */}
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--sec-clr)' }}>
            Login to your Account
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--sec-clr)', opacity: 0.6 }}>
            Please enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--sec-clr)' }}>
                <Mail size={13} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none transition-all"
                onFocus={(e) => (e.target.style.borderColor = 'var(--acc-clr)')}
                onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--sec-clr)' }}>
                  <Lock size={13} />
                  Password
                </label>
                <button type="button" className="text-xs font-semibold hover:underline" style={{ color: 'var(--acc-clr)' }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none transition-all"
                  onFocus={(e) => (e.target.style.borderColor = 'var(--acc-clr)')}
                  onBlur={(e)  => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--acc-clr)' }}
              />
              <label htmlFor="remember" className="text-sm cursor-pointer" style={{ color: 'var(--sec-clr)', opacity: 0.7 }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 rounded-lg text-(-pry-clr) font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: 'var(--acc-clr)' }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              {loading ? <Loader2 className="animate-spin text-(-pry-clr)" /> : (
                <>
                  Login
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Sign up */}
            <p className="text-sm text-center mt-1" style={{ color: 'var(--sec-clr)', opacity: 0.7 }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold hover:underline underline-offset-4" style={{ color: 'var(--acc-clr)', opacity: 1 }}>
                Sign up for free
              </Link>
            </p>

          </form>
        </div>
      </main>
    </>
  );
}