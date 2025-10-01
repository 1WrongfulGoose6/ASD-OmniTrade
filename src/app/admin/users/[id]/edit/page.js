'use client';

import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function AdminEditUserPage({ params }) {
// get user id from url
  const userId = params?.id;

  // state for loading, user data, and form inputs
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  //prevents non admins from accessing restricted pages
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!data.user || data.user.email !== 'admin@example.com') {
          router.replace('/'); // redirect non-admins
        }
      } catch {
        router.replace('/');
      }
    })();
  }, [router]);

  // load the user info when page first opens
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load user');
        const json = await res.json();
        if (cancelled) return;
        setUser(json.user ?? null);
        setName(json.user?.name ?? '');
        setEmail(json.user?.email ?? '');
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // save changes to server when form is submitted
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, email };
      if (showPasswordField && newPassword) payload.password = newPassword;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      router.push('/admin/users');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" /></svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320,480,320,384,320,288,320,192,320,96,320,48,320L0,0Z" /></svg>
      </div>

      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pt-6 pb-16">
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-4 py-3">
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <button
            onClick={() => router.push('/admin/users')}
            className="rounded-full border border-gray-300 bg-white/80 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white transition"
          >
            Back
          </button>
        </div>

        <div className="rounded-2xl bg-white/90 p-6 shadow-xl text-gray-900">
          {loading && <div>Loading…</div>}
          {error && <div className="mb-4 text-red-700">{error}</div>}

          {!loading && user && (
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm"
                />
              </div>

              {/* toggle for password change */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordField(!showPasswordField)}
                  className="text-blue-600 underline text-sm"
                >
                  {showPasswordField ? 'Cancel password change' : 'Change password'}
                </button>
              </div>

              {/* password input (only shows if toggled on) */}
              {showPasswordField && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e)=>setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm"
                  />
                </div>
              )}

              {/* save button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 transition cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}