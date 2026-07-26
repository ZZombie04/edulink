import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center text-primary-700",
        className,
      )}
    >
      <BookOpen className="h-full w-full" strokeWidth={1.75} />
    </span>
  );
}

interface BrandLockupProps {
  className?: string;
  textClassName?: string;
}

export function BrandLockup({ className, textClassName }: BrandLockupProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      <span
        className={cn(
          "text-xl font-bold tracking-[-0.035em] text-ink",
          textClassName,
        )}
      >
        EduLink
      </span>
    </span>
  );
}
