"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";
import Image from "next/image";
import { csrfFetch } from "@/lib/csrfClient";
import { useToast } from "@/components/providers/ToastProvider";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const detectCardType = (num) => {
    if (num.startsWith("4")) return "visa";
    if (/^5[1-5]/.test(num)) return "mastercard";
    if (/^3[47]/.test(num)) return "amex";
    return null;
  };
  const cardType = detectCardType(cardNumber.replace(/\s+/g, ""));

  const validateForm = () => {
    let newErrors = {};

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    }

    const cleanCard = cardNumber.replace(/\s+/g, "");
    if (!/^\d{15,16}$/.test(cleanCard)) {
      newErrors.cardNumber = "Card number must be 15 or 16 digits.";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Use MM/YY format.";
    } else {
      const [mm, yy] = expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) {
        newErrors.expiry = "Invalid month.";
      } else {
        const currentDate = new Date();
        const year = 2000 + yy;
        const currentYear = currentDate.getFullYear();
        const maxYear = currentYear + 20;
        // Guard against obviously invalid future/backdated cards.
        if (year < currentYear || year > maxYear) {
          newErrors.expiry = `Year must be between ${currentYear} and ${maxYear}.`;
        } else {
          const expiryDate = new Date(year, mm, 1);
          if (expiryDate <= currentDate) {
            newErrors.expiry = "Card is expired.";
          }
        }
      }
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setBusy(true);
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 pb-16 pt-8">
        <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/90 p-8 text-gray-900 shadow-lg backdrop-blur">
          <h1 className="mb-6 text-center text-2xl font-bold">Withdraw Funds</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234 5678 9012 3456"
                  className="mt-1 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {cardType === "visa" && <Image src="/visa.png" alt="Visa" width={40} height={25} />}
                {cardType === "mastercard" && <Image src="/mastercard.png" alt="MasterCard" width={40} height={25} />}
                {cardType === "amex" && <Image src="/amex.png" alt="Amex" width={40} height={25} />}
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Expiry</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.expiry && <p className="text-red-500 text-sm">{errors.expiry}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
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
