'use client';

import React from 'react';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) throw new Error(`me ${res.status}`);
        const json = await res.json();
        if (!cancelled) setUser(json.user ?? null);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load user');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg
              className="absolute top-0 left-0 h-64 w-full text-white/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
          >
            <path
                fill="currentColor"
                d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            />
          </svg>
          <svg
              className="absolute bottom-0 left-0 h-64 w-full text-white/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
          >
            <path
                fill="currentColor"
                d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320,480,320,384,320,288,320,192,320,96,320,48,320L0,0Z"
            />
          </svg>
        </div>

        <NavBar />

        <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
          <h1 className="text-4xl font-bold drop-shadow">My Profile</h1>
          <p className="mt-2 text-blue-100/90">
            Manage your account details and settings.
          </p>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-8 pt-6 pb-12">
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            {loading && <div className="text-gray-700">Loading…</div>}
            {error && <div className="text-red-700">Error: {error}</div>}

            {!loading && !error && !user && (
                <div className="text-gray-700">
                  Not signed in.{' '}
                  <Link href="/login" className="text-blue-700 underline">
                    Log in
                  </Link>{' '}
                  or{' '}
                  <Link href="/register" className="text-blue-700 underline">
                    Register
                  </Link>
                  .
                </div>
            )}

            {!loading && !error && user && (
                <>
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
                      {(user.name || user.email || 'U')[0]}
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold">{user.name ?? 'No name'}</h2>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Link
                        href="/profile/edit"
                        className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
                    >
                      Edit Profile
                    </Link>

                    <Link
                        href="/trade-backlog"
                        className="rounded-full bg-gray-200 px-6 py-2 text-sm font-medium text-blue-700 shadow hover:bg-gray-300 transition"
                    >
                      Trade Backlog
                    </Link>
                  </div>
                </>
            )}
          </div>
        </section>
      </main>
  );
}
