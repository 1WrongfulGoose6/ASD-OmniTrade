import Link from "next/link";
import React from "react";

export default function NavBar() {
    return (
    <header className="w-full relative z-10 border-b border-white/15 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
            <div className="text-xl font-semibold tracking-tight">OmniTrade</div>
            <div className="hidden gap-8 text-sm/6 md:flex">
                <Link href="/portfolio" className="hover:opacity-90">Portfolio</Link>
                <Link href="/market-data-display" className="hover:opacity-90">Stock</Link>
                <Link href="/profile" className="hover:opacity-90">Profile</Link>
                <Link href="/settings" className="hover:opacity-90">Settings</Link>
            </div>
            <div className="flex items-center gap-3">
                <Link href="/login" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20">
                    Log in
                </Link>
                <Link href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                    Get Started
                </Link>
            </div>
        </nav>
    </header>
    )
}