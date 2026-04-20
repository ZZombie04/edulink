import { useId } from "react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  const gradientId = useId();

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
          x1="9"
          y1="6"
          x2="40"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B2A57" />
          <stop offset="0.52" stopColor="#0C63D9" />
          <stop offset="1" stopColor="#15926E" />
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
        d="M12.8 23.8 24 15.8l11.2 8"
        stroke="white"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8 23.6h16.4v13.6H15.8V23.6Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M21 27.8h6v9.4h-6v-9.4Z"
        fill="#0B2A57"
        fillOpacity="0.84"
      />
      <path d="M17.9 27.8h2.9v3h-2.9v-3Z" fill="#0C63D9" fillOpacity="0.78" />
      <path d="M27.1 27.8H30v3h-2.9v-3Z" fill="#0C63D9" fillOpacity="0.78" />
      <path
        d="M15.8 37.2h16.4"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
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
