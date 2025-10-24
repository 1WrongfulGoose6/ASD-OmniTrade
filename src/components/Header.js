// Not being used, remove later if confirmed
import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-lg">
      <div className="text-3xl font-bold">
        <Link href="/">OmniTrade</Link>
      </div>
      <nav className="hidden md:flex gap-6 items-center">
        <Link href="/portfolio" className="hover:text-blue-300">Portfolio</Link>
        <Link href="/trade" className="hover:text-blue-300">Stocks</Link>
        <Link href="#" className="hover:text-blue-300">Profile</Link>
        <Link href="#" className="hover:text-blue-300">Settings</Link>
      </nav>
      <div className="flex items-center gap-4">
        <button className="hover:text-blue-300">Log in</button>
        <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-200">
          Get Started
        </button>
      </div>
    </header>
  );
}
