"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveBackground from "./WaveBackground";
import { csrfFetch, getCsrfToken, setCachedCsrfToken } from "@/lib/csrfClient";
import NavBar from "./NavBar";
import { useToast } from "@/components/providers/ToastProvider";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    getCsrfToken().catch(() => {
      // Token fetch failure handled on submit
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await csrfFetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        return;
      }
      const newToken = res.headers.get("x-csrf-token");
      setCachedCsrfToken(newToken);
      // session cookie is set by the server on success
      router.push("/confirmation?msg=Registration%20complete!");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

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
