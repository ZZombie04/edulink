import { BriefcaseBusiness, GraduationCap, MapPin } from "lucide-react";

import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/utils";

const visualTones = [
  {
    background: "linear-gradient(135deg,#0f1c39,#135cc6,#1c8d7c)",
    glow: "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_38%)]",
  },
  {
    background: "linear-gradient(135deg,#182742,#0b5fca,#1774b8)",
    glow: "bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.2),transparent_36%)]",
  },
  {
    background: "linear-gradient(135deg,#152033,#1251af,#2f7dd8)",
    glow: "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_38%)]",
  },
] as const;

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

function getVisualTone(id: string) {
  const index = Number.parseInt(id, 10);
  return visualTones[Number.isNaN(index) ? 0 : index % visualTones.length];
}

export function JobVisual({
  id,
  schoolName,
  schoolRegion,
  gradeLevel,
  employmentType,
  qualificationType,
  qualificationSubject,
  className,
  variant = "card",
}: JobVisualProps) {
  const tone = getVisualTone(id);

  if (variant === "mini") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-white/12 p-3 text-white",
          className,
        )}
        style={{ background: tone.background }}
      >
        <div className={cn("absolute inset-0 opacity-90", tone.glow)} />
        <div className="relative flex h-full flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-white/14 px-2 py-1 text-[10px] font-semibold">
              {schoolRegion}
            </span>
            <BrandMark className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">{schoolName}</div>
            <div className="mt-1 text-[11px] text-white/78">{gradeLevel}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/12 text-white",
        variant === "hero" ? "p-6" : "p-5",
        className,
      )}
      style={{ background: tone.background }}
    >
      <div className={cn("absolute inset-0 opacity-95", tone.glow)} />
      <div className="absolute -right-12 top-8 h-28 w-28 rounded-full bg-white/12 blur-3xl" />
      <div className="absolute bottom-4 left-6 h-16 w-16 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold">
            {schoolRegion}
          </span>
          <BrandMark className="h-10 w-10" />
        </div>

        <div>
          <div
            className={cn(
              "font-bold leading-tight",
              variant === "hero" ? "text-3xl" : "text-xl",
            )}
          >
            {schoolName}
          </div>
          <div className="mt-2 text-sm text-white/82">{gradeLevel}</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/12 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/72">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              근무 형태
            </div>
            <div className="mt-1 text-sm font-semibold">{employmentType}</div>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/72">
              <GraduationCap className="h-3.5 w-3.5" />
              자격 조건
            </div>
            <div className="mt-1 text-sm font-semibold">
              {qualificationType}
              {qualificationSubject ? ` ${qualificationSubject}` : ""}
            </div>
          </div>
        </div>

        {variant === "hero" ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-sm text-white/82">
            <MapPin className="h-4 w-4" />
            {schoolRegion} 교육기관 채용
          </div>
        ) : null}
      </div>
    </div>
  );
}
