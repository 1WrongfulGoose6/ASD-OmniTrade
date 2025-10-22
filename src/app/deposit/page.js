"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";
import Image from "next/image";
import { csrfFetch } from "@/lib/csrfClient";
import { useToast } from "@/components/providers/ToastProvider";

export default function DepositPage() {
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankBsb, setBankBsb] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [cryptoType, setCryptoType] = useState("btc");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [generatedAddress, setGeneratedAddress] = useState(null);
  const [locked, setLocked] = useState(false);
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
    const newErrors = {};
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0)
      newErrors.amount = "Enter a valid amount greater than 0";

    if (method === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (!/^\d{15,16}$/.test(cleanCard))
        newErrors.cardNumber = "Card number must be 15 or 16 digits.";

      if (!/^\d{2}\/\d{2}$/.test(expiry))
        newErrors.expiry = "Use MM/YY format.";
      if (!/^\d{3,4}$/.test(cvv))
        newErrors.cvv = "CVV must be 3 or 4 digits.";
    }

    if (method === "bank") {
      if (!bankAccountName.trim())
        newErrors.bankAccountName = "Account name is required.";
      if (!/^\d{3}-\d{3}$/.test(bankBsb))
        newErrors.bankBsb = "BSB must be in the format 123-456.";
      if (!/^\d{6,10}$/.test(bankAccountNumber))
        newErrors.bankAccountNumber = "Account number must be 6–10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setBusy(true);

    try {
      const res = await csrfFetch("/api/deposit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          cardNumber,
          expiry,
          cvv,
          bankAccountName,
          bankBsb,
          bankAccountNumber,
          cryptoType,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Deposit failed (${res.status})`);

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

  const handleGenerateCryptoAddress = () => {
  const newErrors = { ...errors };
  const amt = Number(amount);

  if (!Number.isFinite(amt) || amt <= 0) {
    newErrors.amount = "Enter a valid amount greater than 0";
    setErrors(newErrors);
    return;
  } else {
    delete newErrors.amount;
    setErrors(newErrors);
  }

  // dummy addresses for crypto types
  const dummyAddress =
    cryptoType === "btc"
      ? "bc1qexampleaddress1234567890"
      : cryptoType === "eth"
      ? "0xExampleEthereumAddress1234567890"
      : "TExampleUSDTAddress1234567890";

  setGeneratedAddress(dummyAddress);
  setLocked(true);
};

const handleCopyAndRedirect = async () => {
  if (!generatedAddress) {
    toast.error("No address available.");
    return;
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    toast.error("Invalid amount.");
    return;
  }

  setBusy(true);
  // Call API
  try {
    const res = await csrfFetch("/api/deposit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        method: "crypto",
        cryptoType,
      }),
    });

    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
      const msg = payload?.error || `Deposit failed (${res.status})`;
      toast.error(msg);
      setBusy(false);
      return;
    }

    // Copy address to clipboard
    try {
      await navigator.clipboard.writeText(generatedAddress);
    } catch (copyErr) {
      console.warn("Clipboard copy failed:", copyErr);
      toast.warn("Could not copy address automatically — please copy it manually.");
    }

    // Show confirmation and redirect
    setShowPopup(true);
    setTimeout(() => {
      router.push("/portfolio");
    }, 1400);
  } catch (err) {
    console.error("Deposit + copy error:", err);
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
          <h1 className="mb-6 text-center text-2xl font-bold">Deposit Funds</h1>

          {/* Method selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["card", "bank", "crypto"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => !locked && setMethod(m)}
                disabled={locked}
                className={`px-4 py-2 rounded-lg border font-medium transition ${
                  method === m
                    ? "bg-blue-600 text-white border-blue-600"
                    : locked
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {m === "card" ? "Credit/Debit" : m === "bank" ? "Bank" : "Crypto"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "card" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="1234 5678 9012 3456"
                      disabled={locked}
                      className="mt-1 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {cardType && (
                      <Image
                        src={`/${cardType}.png`}
                        alt={cardType}
                        width={40}
                        height={25}
                      />
                    )}
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm">{errors.cardNumber}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      disabled={locked}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-sm">{errors.expiry}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      disabled={locked}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {method === "bank" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Mr John Doe"
                    disabled={locked}
                    className="input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  {errors.bankAccountName && (
                    <p className="text-red-500 text-sm">
                      {errors.bankAccountName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    BSB
                  </label>
                  <input
                    type="text"
                    value={bankBsb}
                    onChange={(e) => setBankBsb(e.target.value)}
                    placeholder="123-456"
                    disabled={locked}
                    className="input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  {errors.bankBsb && (
                    <p className="text-red-500 text-sm">{errors.bankBsb}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    disabled={locked}
                    className="input mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="123456789"
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.bankAccountNumber}
                    </p>
                  )}
                </div>
              </>
            )}

            {method === "crypto" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Cryptocurrency
                </label>
                <select
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value)}
                  disabled={locked}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="usdt">Tether (USDT)</option>
                </select>

                {/* Address generation or copy */}
                {!generatedAddress ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleGenerateCryptoAddress}
                      disabled={busy || !amount}
                      className={`w-full rounded-lg px-4 py-2 font-medium text-white transition ${
                        busy || !amount
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gray-800 hover:bg-gray-900"
                      }`}
                    >
                      Generate Deposit Address
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="text-gray-700 text-sm mb-2">
                      Your {cryptoType.toUpperCase()} Deposit Address:
                    </p>
                    <code className="block break-all text-sm mb-3 font-mono">
                      {generatedAddress}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyAndRedirect}
                      className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
                    >
                      Copy and Confirm Deposit
                    </button>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (AUD)
              </label>
              <input
                type="number"
                placeholder="100.00"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  const value = Number(e.target.value);
                  if (value > 0) {
                    setErrors((prev) => {
                      const { amount, ...rest } = prev;
                      return rest;
                    });
                  }
                  }}
                disabled={locked}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>


            {method !== "crypto" && (
              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Processing…" : "Confirm Deposit"}
              </button>
            )}
          </form>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-semibold text-gray-900">
              Deposit Confirmed
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
