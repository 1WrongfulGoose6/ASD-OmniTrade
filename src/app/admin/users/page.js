'use client';

import React from 'react';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManageUsersPage() {
    const router = useRouter();

    // Dummy users (replace with DB later)
    const users = [
        { id: 1, name: "John Smith", email: "jsmith@gmail.com", role: "Trader" },
        { id: 2, name: "John Smith", email: "jsmith2@gmail.com", role: "Trader" },
        { id: 3, name: "John Smith", email: "jsmith3@gmail.com", role: "Trader" },
        { id: 4, name: "John Smith", email: "jsmith4@gmail.com", role: "Trader" },
    ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
       <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320,480,320,384,320,288,320,192,320,96,320,48,320L0,0Z" />
        </svg>
      </div>

      <NavBar />

      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold drop-shadow">Manage Users</h1>
          <p className="mt-2 text-blue-100/90">View and manage all platform users.</p>
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="rounded-full border border-gray-300 bg-white/80 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-white transition cursor-pointer"
        >
          Back
        </button>
      </section>

      {/* Users Table */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-8 pb-12">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200/80 last:border-0">
                    <td className="p-3 text-gray-700">{user.id}</td>
                    <td className="p-3 text-gray-700">{user.name}</td>
                    <td className="p-3 text-gray-700">{user.email}</td>
                    <td className="p-3 text-gray-700">{user.role}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow hover:bg-blue-700 transition cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white shadow hover:bg-red-700 transition cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        className="rounded-full bg-gray-600 px-3 py-1 text-xs font-medium text-white shadow hover:bg-gray-700 transition cursor-pointer"
                      >
                        Blacklist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}