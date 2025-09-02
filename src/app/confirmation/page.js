"use client";
import React, { Suspense } from "react";
import ConfirmationForm from "@/components/ConfirmationForm";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <ConfirmationForm />
    </Suspense>
  );
}
