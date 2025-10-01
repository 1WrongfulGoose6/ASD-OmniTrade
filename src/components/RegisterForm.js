"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveBackground from "./WaveBackground";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Registration failed");
      // uid cookie is set by the server on success
      router.push("/confirmation?msg=Registration%20complete!");
    } catch {
      alert("Network error");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />

      <header className="relative z-10 border-b border-white/15">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-bold tracking-tight hover:opacity-90">OmniTrade</Link>
          <div className="hidden gap-8 text-xl md:flex">
            <Link href="/market-data-display" className="hover:opacity-90">Stocks</Link>
            <Link href="/portfolio" className="hover:opacity-90">Portfolio</Link>
            <Link href="/profile" className="hover:opacity-90">Profile</Link>
            <Link href="/settings" className="hover:opacity-90">Settings</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20">Log in</Link>
            <Link href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-md px-8 flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <h1 className="text-4xl font-bold drop-shadow mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white/85 p-6 rounded-2xl text-gray-900 backdrop-blur">
          <label className="flex flex-col text-sm font-medium">
            Full Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 border rounded-md"
              placeholder="Your name"
            />
          </label>

          <label className="flex flex-col text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border rounded-md"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col text-sm font-medium">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 border rounded-md"
              placeholder="Enter password"
            />
          </label>

          <button type="submit" className="mt-4 py-2 rounded-md font-bold bg-blue-600 hover:bg-blue-700 text-white">
            Register
          </button>
        </form>
      </section>
    </main>
  );
}
