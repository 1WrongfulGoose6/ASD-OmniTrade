// src/app/deposit/page.js
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      alert("Enter a valid amount greater than 0");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : { error: `Non-JSON response (${res.status})`, body: await res.text() };

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please log in to deposit.");
          return;
        }
        throw new Error(payload?.error || `Deposit failed (${res.status})`);
      }

      setShowPopup(true);
      setAmount("");
      setTimeout(() => {
        setShowPopup(false);
        router.push("/portfolio");
      }, 1200);
    } catch (err) {
      alert(err.message || "Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 pb-16 pt-8">
        <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/90 p-8 text-gray-900 shadow-lg backdrop-blur">
          <h1 className="mb-6 text-center text-2xl font-bold">Deposit Funds</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Expiry</label>
                <input type="text" placeholder="MM/YY"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input type="password" placeholder="123"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (AUD)</label>
              <input
                type="number"
                placeholder="100.00"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button type="submit" disabled={busy}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
              {busy ? "Processing…" : "Confirm Deposit"}
            </button>
          </form>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">Deposit recorded</p>
          </div>
        </div>
      )}
    </main>
  );
}
