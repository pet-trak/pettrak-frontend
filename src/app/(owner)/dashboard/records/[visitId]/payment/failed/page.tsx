// src/app/(owner)/dashboard/records/payment/failed/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function GenericPaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");

  return (
    <main className="min-h-screen bg-[#f7f5f0] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fff1f1] border border-[#fcd4d4] mb-5">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d9534f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[#0f2e1f] mb-2">
          Payment Not Confirmed
        </h1>
        <p className="text-sm text-[#6b7a6e] mb-1">
          Verification failed
        </p>
        {reference && (
          <p className="text-xs text-[#a0a89e] mb-8">
            Reference:{" "}
            <span className="font-mono font-medium text-[#0f2e1f]">
              {reference}
            </span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/records")}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#0f2e1f] text-white text-sm font-semibold hover:bg-[#1a4a31] transition-colors"
          >
            Try Again
          </button>
          <a
            href="mailto:support@pettrak.com"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-[#e0dbd0] bg-white text-[#0f2e1f] text-sm font-semibold hover:border-[#0f2e1f] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}