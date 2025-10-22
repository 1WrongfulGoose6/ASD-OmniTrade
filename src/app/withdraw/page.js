// src/app/withdraw/page.js
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";
import { csrfFetch } from "@/lib/csrfClient";
import { useToast } from "@/components/providers/ToastProvider";

export default function WithdrawPage() {
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [formData, setFormData] = useState({
    accountName: "",
    bsb: "",
    accountNumber: "",
    walletAddress: "",
    network: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    }

    if (method === "bank") {
      if (!formData.accountName.trim()) newErrors.accountName = "Required";
      if (!/^\d{3}-\d{3}$/.test(formData.bsb)) newErrors.bsb = "Use format 000-000";
      if (!/^\d{6,9}$/.test(formData.accountNumber)) newErrors.accountNumber = "Invalid account number";
    }

    if (method === "crypto") {
      if (!formData.walletAddress.trim()) newErrors.walletAddress = "Required";
      if (!formData.network.trim()) newErrors.network = "Required";
    }

    if (method === "voucher") {
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setBusy(true);
    // Call API
    try {
      const res = await csrfFetch("/api/withdraw", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : { error: `Non-JSON response (${res.status})`, body: await res.text() };

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please log in to withdraw.");
          return;
        }
        throw new Error(payload?.error || `Withdrawal failed (${res.status})`);
      }

      setShowPopup(true);
      setAmount("");
      setTimeout(() => {
        setShowPopup(false);
        router.push("/portfolio");
      }, 1200);
    } catch (err) {
      toast.error(err.message || "Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  // Render form depending on withdrawal method
  const renderMethodFields = () => {
    switch (method) {
      case "bank":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="John Smith"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              {errors.accountName && <p className="text-red-500 text-sm">{errors.accountName}</p>}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">BSB</label>
                <input
                  type="text"
                  value={formData.bsb}
                  onChange={(e) => setFormData({ ...formData, bsb: e.target.value })}
                  placeholder="123-456"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                {errors.bsb && <p className="text-red-500 text-sm">{errors.bsb}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="12345678"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                {errors.accountNumber && <p className="text-red-500 text-sm">{errors.accountNumber}</p>}
              </div>
            </div>
          </>
        );

      case "crypto":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                placeholder="0xABC123..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              {errors.walletAddress && <p className="text-red-500 text-sm">{errors.walletAddress}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Network</label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder="Ethereum, Bitcoin, etc."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              {errors.network && <p className="text-red-500 text-sm">{errors.network}</p>}
            </div>
          </>
        );

      case "voucher":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">Email for Voucher</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
        );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 pb-16 pt-8">
        <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/90 p-8 text-gray-900 shadow-lg backdrop-blur">
          <h1 className="mb-6 text-center text-2xl font-bold">Withdraw Funds</h1>

          {/* --- Payment Method Selector --- */}
          <div className="flex justify-center gap-3 mb-6">
            {["bank", "crypto", "voucher"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-4 py-2 rounded-lg border font-medium ${
                  method === m
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {m === "bank" ? "Bank Transfer" : m === "crypto" ? "Crypto" : "Voucher"}
              </button>
            ))}
          </div>

          {/* --- Conditional Form --- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderMethodFields()}

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (AUD)</label>
              <input
                type="number"
                placeholder="100.00"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? "Processing…" : "Confirm Withdrawal"}
            </button>
          </form>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">Withdrawal recorded</p>
          </div>
        </div>
      )}
    </main>
  );
}
