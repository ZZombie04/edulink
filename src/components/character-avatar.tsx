import { useId } from "react";

import { getAvatarPreset, type AvatarPresetId } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils";

function HairShape({
  style,
  color,
}: {
  style: string;
  color: string;
}) {
  switch (style) {
    case "bob":
      return (
        <>
          <path
            d="M25 40c0-13 10-23 23-23 13 0 23 10 23 23v10c0 7-5 12-11 12H36c-6 0-11-5-11-12V40Z"
            fill={color}
          />
          <path d="M28 40c3-7 9-11 20-11s17 4 20 11v-7c0-10-8-18-20-18s-20 8-20 18v7Z" fill={color} />
        </>
      );
    case "long":
      return (
        <>
          <path d="M24 39c0-14 10-24 24-24s24 10 24 24v24c-5 5-11 8-24 8S29 68 24 63V39Z" fill={color} />
          <path d="M30 28c5-5 12-8 18-8 11 0 18 7 20 16-4-7-12-11-20-11-9 0-14 3-18 8Z" fill={color} />
        </>
      );
    case "bun":
      return (
        <>
          <circle cx="49" cy="15" r="8" fill={color} />
          <path d="M26 40c0-14 10-23 22-23 12 0 22 9 22 23v12c0 5-4 9-9 9H35c-5 0-9-4-9-9V40Z" fill={color} />
        </>
      );
    case "pony":
      return (
        <>
          <path d="M27 40c0-13 9-22 21-22 12 0 21 9 21 22v10c0 6-4 10-10 10H37c-6 0-10-4-10-10V40Z" fill={color} />
          <path d="M67 39c8 3 12 11 10 19-5-4-10-7-15-8Z" fill={color} />
        </>
      );
    case "crop":
      return (
        <path d="M27 39c0-14 10-24 22-24 8 0 16 4 20 11l-2 10c-5-5-11-8-20-8-7 0-13 2-20 8Z" fill={color} />
      );
    case "side":
      return (
        <path d="M26 39c0-13 10-23 23-23 10 0 18 6 21 16-6-4-11-6-20-6-10 0-17 5-24 13Z" fill={color} />
      );
    case "parted":
      return (
        <path d="M26 39c0-13 9-23 22-23 13 0 22 10 22 23-4-6-9-11-17-12v9H43v-9c-8 1-13 6-17 12Z" fill={color} />
      );
    case "wave":
      return (
        <>
          <path d="M25 40c0-14 10-23 23-23 14 0 23 9 23 23v14c0 5-4 9-9 9H34c-5 0-9-4-9-9V40Z" fill={color} />
          <path d="M29 28c5-6 11-8 19-8 11 0 18 6 21 15-5-4-9-6-14-6-5 0-9 1-13 4-4-4-8-5-13-5Z" fill={color} />
        </>
      );
    case "round":
      return (
        <>
          <path d="M26 40c0-14 10-24 22-24 12 0 22 10 22 24v12c0 6-4 10-10 10H36c-6 0-10-4-10-10V40Z" fill={color} />
          <circle cx="48" cy="22" r="14" fill={color} />
        </>
      );
    default:
      return (
        <>
          <path d="M26 40c0-14 10-24 22-24 12 0 22 10 22 24v12c0 6-4 10-10 10H36c-6 0-10-4-10-10V40Z" fill={color} />
          <path d="M29 30c4-6 10-9 19-9 8 0 14 3 19 9-6-3-12-5-19-5-7 0-13 2-19 5Z" fill={color} />
        </>
      );
  }
}

function Accessory({
  kind,
  accent,
}: {
  kind: string;
  accent: string;
}) {
  if (kind === "glasses") {
    return (
      <>
        <rect x="34" y="41" width="10" height="8" rx="3" fill="none" stroke="#243041" strokeWidth="1.8" />
        <rect x="52" y="41" width="10" height="8" rx="3" fill="none" stroke="#243041" strokeWidth="1.8" />
        <path d="M44 45h8" stroke="#243041" strokeWidth="1.6" strokeLinecap="round" />
      </>
    );
  }

  if (kind === "clip") {
    return <rect x="61" y="28" width="7" height="4" rx="2" fill={accent} />;
  }

  if (kind === "earring") {
    return (
      <>
        <circle cx="34" cy="54" r="1.8" fill={accent} />
        <circle cx="62" cy="54" r="1.8" fill={accent} />
      </>
    );
  }

  if (kind === "star") {
    return (
      <path
        d="M63 27l1.8 3.6 4 .6-2.9 2.8.7 3.9-3.6-1.9-3.6 1.9.7-3.9-2.9-2.8 4-.6Z"
        fill={accent}
      />
    );
  }

  return null;
}

export function CharacterAvatar({
  presetId,
  className,
  size = 64,
}: {
  presetId?: AvatarPresetId;
  className?: string;
  size?: number;
}) {
  const preset = getAvatarPreset(presetId);
  const gradientId = useId().replace(/:/g, "");

  return (
    <div
      aria-label={preset.name}
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-[18px] border border-white/60 bg-white shadow-panel",
        className
      )}
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 96 96"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="12" x2="84" y1="8" y2="88">
            <stop offset="0%" stopColor={preset.backgroundFrom} />
            <stop offset="100%" stopColor={preset.backgroundTo} />
          </linearGradient>
        </defs>

        <rect x="4" y="4" width="88" height="88" rx="24" fill={`url(#${gradientId})`} />
        <path d="M17 88c5-16 16-24 31-24s26 8 31 24" fill={preset.shirt} />
        <ellipse cx="48" cy="43" rx="18" ry="20" fill={preset.skin} />
        <HairShape color={preset.hair} style={preset.hairStyle} />
        <path d="M34 72c4-7 9-10 14-10 6 0 11 3 14 10" fill={preset.shirt} opacity="0.88" />
        <circle cx="41" cy="45" r="1.8" fill="#253041" />
        <circle cx="55" cy="45" r="1.8" fill="#253041" />
        <path
          d="M42 53c2 2 10 2 12 0"
          fill="none"
          stroke="#253041"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M47 47c-.4 2.4-.4 3.7 1.6 4.3"
          fill="none"
          stroke="#d08e78"
          strokeLinecap="round"
          strokeWidth="1.2"
        />
        <Accessory accent={preset.accent} kind={preset.accessory} />
      </svg>
    </div>
  );
}
