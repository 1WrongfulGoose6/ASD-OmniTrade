import React from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login - OmniTrade",
  description: "Access your OmniTrade account",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Background waves */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20"
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"
             preserveAspectRatio="none">
          <path fill="currentColor"
                d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224V0H0Z"/>
        </svg>
      </div>

      <section className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/85 p-8 text-gray-900 backdrop-blur">
          <h1 className="text-2xl font-bold mb-6 text-center">Log in to OmniTrade</h1>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
