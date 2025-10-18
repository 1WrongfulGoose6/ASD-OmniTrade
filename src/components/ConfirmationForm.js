"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from 'react';

export default function ConfirmationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg") || "Action completed!";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />

      <section className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white/85 text-gray-900 p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-4">{msg}</h1>
          <p className="text-gray-700">Redirecting to the main menu...</p>
        </div>
      </section>
    </main>
  );
}
