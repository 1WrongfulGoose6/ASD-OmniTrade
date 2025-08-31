"use client";

import React, { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
    // TODO: Integrate backend later
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <button
        type="submit"
        className="mt-4 py-2 rounded-md font-bold bg-blue-600 hover:bg-blue-700 text-white"
      >
        Log In
      </button>
    </form>
  );
}
