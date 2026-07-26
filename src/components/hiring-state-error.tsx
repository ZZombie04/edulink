"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface HiringStateErrorProps {
  message: string;
  onRetry: () => Promise<unknown>;
}

export function HiringStateError({
  message,
  onRetry,
}: HiringStateErrorProps) {
  return (
    <div
      className="rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-5 py-4 text-[#8b3328]"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            채용 데이터를 불러오지 못했습니다.
          </div>
          <p className="mt-1 break-keep text-sm leading-6">{message}</p>
          <button
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cf8e82] bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b3328]"
            onClick={() => void onRetry().catch(() => undefined)}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            다시 불러오기
          </button>
        </div>
      </div>
    </div>
  );
}
