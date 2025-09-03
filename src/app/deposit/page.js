"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function DepositPage() {
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push("/portfolio");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen p-8 px-32 bg-gradient-to-br from-blue-600 to-blue-400 relative overflow-hidden">
      {/* Background waves */}
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
            d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* NavBar */}
      <NavBar />

      {/* Centered Deposit Card */}
      <main className="relative z-10 flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/90 p-8 text-gray-900 shadow-lg backdrop-blur">
          <h1 className="mb-6 text-2xl font-bold text-center">Deposit Funds</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="password"
                  placeholder="123"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (USD)
              </label>
              <input
                type="number"
                placeholder="100.00"
                min="1"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition"
            >
              Confirm Deposit
            </button>
          </form>
        </div>
      </main>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">
              transfer initiated
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
