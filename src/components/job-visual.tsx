import {
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  School2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type JobVisualVariant = "card" | "hero" | "mini";

interface JobVisualProps {
  id: string;
  schoolName: string;
  schoolRegion: string;
  gradeLevel: string;
  employmentType: string;
  qualificationType: string;
  qualificationSubject?: string;
  className?: string;
  variant?: JobVisualVariant;
}

export function JobVisual({
  schoolName,
  schoolRegion,
  gradeLevel,
  employmentType,
  qualificationType,
  qualificationSubject,
  className,
  variant = "card",
}: JobVisualProps) {
  const isHero = variant === "hero";

  if (variant === "mini") {
    return (
      <div
        className={cn(
          "flex h-full flex-col justify-between border border-outline bg-surface-contrast p-3 text-ink",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
          <span>{schoolRegion}</span>
          <School2 className="h-4 w-4 text-primary-600" />
        </div>
        <div>
          <div className="text-sm font-bold">{schoolName}</div>
          <div className="mt-1 text-[11px] text-ink-muted">{gradeLevel}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between border p-5",
        isHero
          ? "border-white/15 bg-primary-900 text-white sm:p-7"
          : "border-outline bg-surface-contrast text-ink",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "inline-flex items-center gap-2 text-xs font-semibold",
            isHero ? "text-white/70" : "text-ink-muted",
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          {schoolRegion}
        </div>
        <School2
          className={cn(
            "h-6 w-6",
            isHero ? "text-[#b9d3c5]" : "text-primary-600",
          )}
          strokeWidth={1.6}
        />
      </div>

      <div className="my-8">
        <div
          className={cn(
            "font-bold tracking-[-0.035em]",
            isHero ? "text-3xl sm:text-4xl" : "text-xl",
          )}
        >
          {schoolName}
        </div>
        <div
          className={cn(
            "mt-2 text-sm",
            isHero ? "text-white/72" : "text-ink-soft",
          )}
        >
          {gradeLevel}
        </div>
      </div>

      <dl
        className={cn(
          "grid gap-0 border-y sm:grid-cols-2",
          isHero ? "border-white/16" : "border-outline",
        )}
      >
        <div className="py-3 sm:pr-4">
          <dt
            className={cn(
              "flex items-center gap-2 text-xs",
              isHero ? "text-white/60" : "text-ink-muted",
            )}
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            근무 형태
          </dt>
          <dd className="mt-1.5 text-sm font-semibold">{employmentType}</dd>
        </div>
        <div
          className={cn(
            "border-t py-3 sm:border-l sm:border-t-0 sm:pl-4",
            isHero ? "border-white/16" : "border-outline",
          )}
        >
          <dt
            className={cn(
              "flex items-center gap-2 text-xs",
              isHero ? "text-white/60" : "text-ink-muted",
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            자격 조건
          </dt>
          <dd className="mt-1.5 text-sm font-semibold">
            {qualificationType}
            {qualificationSubject ? ` · ${qualificationSubject}` : ""}
          </dd>
        </div>
      </dl>
    </div>
  );
}
