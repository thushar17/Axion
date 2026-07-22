"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    window.location.href = `${API_URL}/auth/google/callback?${params}`;
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">Completing Google Authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
