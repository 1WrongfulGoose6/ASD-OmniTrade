'use client';

import { useSearchParams } from "next/navigation";

function ConfirmationMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Action confirmed.";

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Confirmation</h1>
      <p className="mt-4 text-lg">{message}</p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-gray-100">
        <ConfirmationMessage />
    </div>
  );
}