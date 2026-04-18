import { useId } from "react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  const gradientId = useId();
  const glowId = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn("h-11 w-11 shrink-0", className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="6"
          y1="5"
          x2="42"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F234A" />
          <stop offset="0.52" stopColor="#0C63D9" />
          <stop offset="1" stopColor="#1BB58F" />
        </linearGradient>
        <linearGradient
          id={glowId}
          x1="13"
          y1="13"
          x2="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.92" />
          <stop offset="1" stopColor="white" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="15"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M15.2 14.8c3.72 0 6.38 1.26 8.8 4.18 2.42-2.92 5.08-4.18 8.8-4.18v15.7c-3.31 0-5.6.92-7.84 3.12a1.34 1.34 0 0 1-1.92 0c-2.24-2.2-4.53-3.12-7.84-3.12V14.8Z"
        fill={`url(#${glowId})`}
      />
      <path
        d="M19.2 18.6v10.03c1.56.35 2.93.95 4.2 1.88V20.58c-1.12-1.31-2.32-1.92-4.2-1.98Z"
        fill="#0D4FA5"
        fillOpacity="0.28"
      />
      <path
        d="M28.8 18.6c-1.88.06-3.08.67-4.2 1.98v9.93a12.7 12.7 0 0 1 4.2-1.88V18.6Z"
        fill="#0D4FA5"
        fillOpacity="0.22"
      />
      <circle cx="24" cy="16.1" r="1.7" fill="white" />
    </svg>
  );
}

interface BrandLockupProps {
  className?: string;
  textClassName?: string;
}

export function BrandLockup({ className, textClassName }: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <div className={cn("text-lg font-bold tracking-tight", textClassName)}>
        EduLink
      </div>
    </div>
  );
}
