import { useId } from "react";

import { getAvatarPreset, type AvatarPresetId } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils";

function BackdropShape({
  style,
  accent,
  glow,
}: {
  style: string;
  accent: string;
  glow: string;
}) {
  switch (style) {
    case "dots":
      return (
        <>
          <circle cx="26" cy="28" r="10" fill={glow} opacity="0.85" />
          <circle cx="94" cy="30" r="7" fill={accent} opacity="0.55" />
          <circle cx="88" cy="84" r="12" fill={glow} opacity="0.62" />
          <circle cx="28" cy="88" r="8" fill={accent} opacity="0.4" />
        </>
      );
    case "arc":
      return (
        <>
          <path
            d="M9 76c17-27 41-38 72-33 11 2 20 6 31 14v40H8c-1-8-1-15 1-21Z"
            fill={glow}
            opacity="0.78"
          />
          <path
            d="M80 12c14 4 23 13 28 28-8-2-15-2-22 1-7 2-13 6-18 11-1-18 3-31 12-40Z"
            fill={accent}
            opacity="0.44"
          />
        </>
      );
    case "ribbon":
      return (
        <>
          <path
            d="M-4 26c24-6 45-4 63 5 11 6 22 15 33 29-21-4-41-3-60 3-15 4-28 11-41 21V26Z"
            fill={glow}
            opacity="0.72"
          />
          <path
            d="M66 4c24 6 38 20 42 42-11-4-24-5-38-1-7 2-14 6-22 11 0-24 6-41 18-52Z"
            fill={accent}
            opacity="0.36"
          />
        </>
      );
    case "sparkle":
      return (
        <>
          <circle cx="26" cy="28" r="11" fill={glow} opacity="0.84" />
          <circle cx="92" cy="84" r="14" fill={glow} opacity="0.62" />
          <path d="M88 22l2.2 5.2 5.2 2.2-5.2 2.2-2.2 5.2-2.2-5.2-5.2-2.2 5.2-2.2Z" fill={accent} opacity="0.8" />
          <path d="M24 76l1.7 4 4 1.7-4 1.7-1.7 4-1.7-4-4-1.7 4-1.7Z" fill={accent} opacity="0.75" />
        </>
      );
    case "panel":
      return (
        <>
          <rect x="12" y="14" width="96" height="34" rx="18" fill={glow} opacity="0.78" />
          <rect x="18" y="68" width="84" height="22" rx="11" fill={accent} opacity="0.33" />
        </>
      );
    default:
      return (
        <>
          <circle cx="62" cy="30" r="28" fill={glow} opacity="0.82" />
          <circle cx="24" cy="92" r="13" fill={accent} opacity="0.28" />
        </>
      );
  }
}

function HairShape({
  style,
  hair,
  shine,
}: {
  style: string;
  hair: string;
  shine: string;
}) {
  switch (style) {
    case "soft-bob":
      return (
        <>
          <path d="M28 48c0-19 14-31 32-31 20 0 32 13 32 32v17c0 7-5 12-12 12H40c-7 0-12-5-12-12V48Z" fill={hair} />
          <path d="M35 33c7-8 16-11 25-11 13 0 23 5 30 17-8-5-19-7-31-7-10 0-18 2-24 7Z" fill={shine} opacity="0.48" />
        </>
      );
    case "long-wave":
      return (
        <>
          <path d="M26 47c0-18 13-31 33-31 19 0 33 13 33 31v31c-8 8-19 12-33 12S34 86 26 78V47Z" fill={hair} />
          <path d="M31 34c8-9 17-13 29-13 14 0 24 6 31 18-9-6-19-9-31-9-11 0-21 2-29 4Z" fill={shine} opacity="0.44" />
        </>
      );
    case "top-bun":
      return (
        <>
          <circle cx="65" cy="16" r="10" fill={hair} />
          <path d="M29 49c0-17 13-29 31-29 18 0 31 12 31 29v15c0 8-5 13-13 13H42c-8 0-13-5-13-13V49Z" fill={hair} />
          <path d="M38 29c7-6 14-8 22-8 10 0 18 4 24 11-7-2-14-3-23-3-8 0-16 0-23 0Z" fill={shine} opacity="0.35" />
        </>
      );
    case "pony-tail":
      return (
        <>
          <path d="M30 49c0-18 12-30 30-30 19 0 31 12 31 30v15c0 8-5 13-13 13H43c-8 0-13-5-13-13V49Z" fill={hair} />
          <path d="M88 49c12 5 17 14 16 28-7-5-14-9-21-11Z" fill={hair} />
          <path d="M39 31c7-7 14-10 22-10 11 0 19 4 26 12-7-3-15-5-24-5-9 0-17 1-24 3Z" fill={shine} opacity="0.4" />
        </>
      );
    case "classic-part":
      return (
        <>
          <path d="M28 47c0-18 13-31 32-31 18 0 31 12 31 31-4-6-10-11-20-14l-2 13H52l-2-13c-9 3-16 8-22 14Z" fill={hair} />
          <path d="M55 20c8 0 16 3 22 9-7-2-14-3-22-3-9 0-16 1-23 4 6-7 14-10 23-10Z" fill={shine} opacity="0.36" />
        </>
      );
    case "soft-crop":
      return (
        <>
          <path d="M31 48c1-18 13-30 30-30 11 0 22 5 29 16-8-4-17-5-28-5-10 0-20 4-31 19Z" fill={hair} />
          <path d="M43 23c6-3 12-5 19-5 10 0 18 3 25 10-7-2-15-2-23-1-8 1-15 3-21 6Z" fill={shine} opacity="0.38" />
        </>
      );
    case "slick-side":
      return (
        <>
          <path d="M28 48c0-18 13-30 31-30 15 0 27 9 31 24-8-5-18-8-30-8-12 0-22 5-32 14Z" fill={hair} />
          <path d="M43 21c6-2 12-3 18-3 10 0 19 3 26 10-8-1-16-2-25-1-7 1-14 2-19 5Z" fill={shine} opacity="0.38" />
        </>
      );
    case "short-wave":
      return (
        <>
          <path d="M29 49c0-18 13-30 31-30 18 0 30 11 30 29v12c0 6-3 10-9 12-2-7-5-13-10-16-3-2-7-4-11-4-10 0-19 8-28 8-2 0-3 0-3-2V49Z" fill={hair} />
          <path d="M38 28c7-6 14-8 23-8 11 0 20 3 28 11-8-3-16-4-25-4-9 0-17 0-26 1Z" fill={shine} opacity="0.36" />
        </>
      );
    case "straight-lob":
      return (
        <>
          <path d="M28 47c0-18 14-30 32-30 18 0 32 12 32 31v24c-6 6-16 9-32 9-15 0-26-3-32-9V47Z" fill={hair} />
          <path d="M37 31c7-7 15-10 24-10 11 0 20 4 28 11-8-2-17-4-27-4-9 0-17 1-25 3Z" fill={shine} opacity="0.38" />
        </>
      );
    case "rounded-bob":
      return (
        <>
          <path d="M28 49c0-19 14-31 32-31 19 0 31 13 31 31v17c0 8-5 13-13 13H41c-8 0-13-5-13-13V49Z" fill={hair} />
          <path d="M40 29c6-5 13-8 21-8 11 0 19 4 27 11-8-2-15-3-24-3s-16 0-24 0Z" fill={shine} opacity="0.35" />
        </>
      );
    case "curly-short":
      return (
        <>
          <circle cx="43" cy="31" r="10" fill={hair} />
          <circle cx="56" cy="25" r="11" fill={hair} />
          <circle cx="69" cy="31" r="10" fill={hair} />
          <circle cx="80" cy="39" r="9" fill={hair} />
          <circle cx="32" cy="39" r="9" fill={hair} />
          <path d="M30 49c0-16 13-28 30-28 18 0 31 12 31 29v14c0 8-5 13-13 13H43c-8 0-13-5-13-13V49Z" fill={hair} />
          <path d="M43 23c5-2 10-3 17-3 8 0 15 2 21 7-6 0-12 0-18 1-6 0-13 1-20 3Z" fill={shine} opacity="0.33" />
        </>
      );
    case "long-braid":
      return (
        <>
          <path d="M28 47c0-18 13-30 32-30 18 0 31 12 31 30v29c-6 8-17 13-31 13S35 84 28 76V47Z" fill={hair} />
          <path d="M79 62c6 8 8 16 7 24-5-3-10-5-14-6l1-8-5-6 8-4 3 0Z" fill={hair} />
          <path d="M37 31c7-7 15-10 24-10 11 0 19 4 27 11-8-2-16-4-25-4-9 0-18 1-26 3Z" fill={shine} opacity="0.36" />
        </>
      );
    case "coily-round":
      return (
        <>
          <circle cx="38" cy="33" r="11" fill={hair} />
          <circle cx="50" cy="24" r="10" fill={hair} />
          <circle cx="64" cy="22" r="10" fill={hair} />
          <circle cx="77" cy="30" r="11" fill={hair} />
          <circle cx="84" cy="42" r="10" fill={hair} />
          <circle cx="28" cy="43" r="10" fill={hair} />
          <path d="M29 51c0-16 14-27 31-27 18 0 31 11 31 28v13c0 8-5 13-13 13H42c-8 0-13-5-13-13V51Z" fill={hair} />
          <path d="M45 21c5-2 11-3 18-3 8 0 15 2 21 8-8 0-15 0-22 1-6 0-12 1-17 3Z" fill={shine} opacity="0.26" />
        </>
      );
    case "side-lob":
      return (
        <>
          <path d="M28 47c0-18 14-30 32-30 18 0 32 12 32 31v24c-8 8-18 12-32 12S36 80 28 72V47Z" fill={hair} />
          <path d="M32 43c8-12 18-18 29-18 10 0 18 3 25 9-8 0-15 1-22 4-11 4-18 8-25 5Z" fill={shine} opacity="0.38" />
        </>
      );
    case "volumn-wave":
      return (
        <>
          <path d="M27 47c0-18 14-30 33-30s32 12 32 31v21c-7 8-18 12-32 12S35 77 27 69V47Z" fill={hair} />
          <path d="M32 31c7-8 16-12 27-12 13 0 24 5 31 16-9-4-19-6-30-6-10 0-19 1-28 2Z" fill={shine} opacity="0.39" />
        </>
      );
    case "neat-short":
      return (
        <>
          <path d="M31 48c0-17 13-29 30-29 12 0 22 4 29 13-8-2-18-2-30 0-12 2-22 8-29 16Z" fill={hair} />
          <path d="M44 23c5-2 11-3 17-3 9 0 17 2 25 8-7 0-14 0-21 1-8 0-15 1-21 4Z" fill={shine} opacity="0.34" />
        </>
      );
    default:
      return <path d="M28 47c0-18 14-30 32-30 18 0 32 12 32 31v15c0 8-5 13-13 13H41c-8 0-13-5-13-13V47Z" fill={hair} />;
  }
}

function OutfitShape({
  style,
  outerwear,
  innerwear,
  accent,
}: {
  style: string;
  outerwear: string;
  innerwear: string;
  accent: string;
}) {
  switch (style) {
    case "cardigan":
      return (
        <>
          <path d="M16 118c5-20 20-32 44-32s39 12 44 32H16Z" fill={outerwear} />
          <path d="M41 88c6 9 12 14 19 14 6 0 12-5 18-14l7 30H35l6-30Z" fill={innerwear} />
          <path d="M48 88h24l-4 30H52l-4-30Z" fill={accent} opacity="0.32" />
        </>
      );
    case "coat":
      return (
        <>
          <path d="M14 118c6-21 21-34 46-34s40 13 46 34H14Z" fill={outerwear} />
          <path d="M39 86c7 7 13 11 21 11 7 0 14-4 21-11l7 32H32l7-32Z" fill={innerwear} />
          <path d="M56 86h8l4 32H52l4-32Z" fill={accent} opacity="0.48" />
        </>
      );
    case "knit":
      return (
        <>
          <path d="M15 118c5-18 21-31 45-31s39 13 45 31H15Z" fill={outerwear} />
          <path d="M46 88c4 5 8 8 14 8 5 0 10-3 14-8l4 30H42l4-30Z" fill={innerwear} opacity="0.9" />
          <path d="M26 103c8-4 19-6 34-6 13 0 24 2 34 6" fill="none" opacity="0.24" stroke={accent} strokeLinecap="round" strokeWidth="4" />
        </>
      );
    case "jacket":
      return (
        <>
          <path d="M15 118c5-20 20-33 45-33s40 13 45 33H15Z" fill={outerwear} />
          <path d="M40 87c6 8 13 12 20 12s14-4 20-12l8 31H32l8-31Z" fill={innerwear} />
          <path d="M53 87h14l7 31H46l7-31Z" fill={accent} opacity="0.36" />
        </>
      );
    default:
      return (
        <>
          <path d="M15 118c5-20 20-33 45-33s40 13 45 33H15Z" fill={outerwear} />
          <path d="M40 87c7 8 13 12 20 12 8 0 14-4 21-12l7 31H32l8-31Z" fill={innerwear} />
          <path d="M55 87h10l4 31H51l4-31Z" fill={accent} opacity="0.42" />
        </>
      );
  }
}

function Eyes({ style }: { style: string }) {
  switch (style) {
    case "smile":
      return (
        <>
          <path d="M43 57c2 2 5 2 7 0" fill="none" stroke="#273246" strokeLinecap="round" strokeWidth="2.2" />
          <path d="M70 57c2 2 5 2 7 0" fill="none" stroke="#273246" strokeLinecap="round" strokeWidth="2.2" />
        </>
      );
    case "focus":
      return (
        <>
          <ellipse cx="47" cy="57" rx="2.4" ry="3" fill="#273246" />
          <ellipse cx="73" cy="57" rx="2.4" ry="3" fill="#273246" />
          <path d="M42 52c3-2 7-2 10 0" fill="none" stroke="#273246" strokeLinecap="round" strokeWidth="1.6" />
          <path d="M68 52c3-2 7-2 10 0" fill="none" stroke="#273246" strokeLinecap="round" strokeWidth="1.6" />
        </>
      );
    case "bright":
      return (
        <>
          <ellipse cx="47" cy="57" rx="2.7" ry="3.1" fill="#273246" />
          <ellipse cx="73" cy="57" rx="2.7" ry="3.1" fill="#273246" />
          <circle cx="48" cy="56" r="0.7" fill="#fff" />
          <circle cx="74" cy="56" r="0.7" fill="#fff" />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="47" cy="57" rx="2.3" ry="2.7" fill="#273246" />
          <ellipse cx="73" cy="57" rx="2.3" ry="2.7" fill="#273246" />
        </>
      );
  }
}

function Mouth({ style }: { style: string }) {
  switch (style) {
    case "grin":
      return <path d="M50 69c3 3 17 3 20 0" fill="none" stroke="#a4595c" strokeLinecap="round" strokeWidth="2.4" />;
    case "calm":
      return <path d="M53 69c4 1 9 1 14 0" fill="none" stroke="#a4595c" strokeLinecap="round" strokeWidth="2" />;
    default:
      return <path d="M50 68c3 4 17 4 20 0" fill="none" stroke="#a4595c" strokeLinecap="round" strokeWidth="2.1" />;
  }
}

function Accessory({
  kind,
  accent,
}: {
  kind: string;
  accent: string;
}) {
  switch (kind) {
    case "glasses":
      return (
        <>
          <rect x="37" y="53" width="13" height="10" rx="4" fill="none" stroke="#273246" strokeWidth="1.7" />
          <rect x="70" y="53" width="13" height="10" rx="4" fill="none" stroke="#273246" strokeWidth="1.7" />
          <path d="M50 58h20" fill="none" stroke="#273246" strokeLinecap="round" strokeWidth="1.6" />
        </>
      );
    case "clip":
      return <rect x="79" y="33" width="10" height="5" rx="2.5" fill={accent} />;
    case "earring":
      return (
        <>
          <circle cx="35" cy="70" r="2" fill={accent} />
          <circle cx="84" cy="70" r="2" fill={accent} />
        </>
      );
    case "headset":
      return (
        <>
          <path d="M31 58c0-17 13-30 29-30s29 13 29 30" fill="none" stroke="#273246" strokeWidth="3" />
          <rect x="27" y="57" width="8" height="15" rx="4" fill="#273246" />
          <rect x="85" y="57" width="8" height="15" rx="4" fill="#273246" />
        </>
      );
    case "pin":
      return <circle cx="78" cy="91" r="4" fill={accent} opacity="0.88" />;
    case "star":
      return (
        <path
          d="M84 26l2.2 5.5 5.6 2.2-5.6 2.2-2.2 5.6-2.2-5.6-5.6-2.2 5.6-2.2Z"
          fill={accent}
        />
      );
    default:
      return null;
  }
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
        "inline-flex items-center justify-center overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-[0_18px_38px_rgba(22,34,54,0.18)]",
        className
      )}
      style={{ height: size, width: size }}
    >
      <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradientId} x1="10" x2="110" y1="10" y2="110">
            <stop offset="0%" stopColor={preset.backgroundFrom} />
            <stop offset="100%" stopColor={preset.backgroundTo} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="120" height="120" rx="30" fill={`url(#${gradientId})`} />
        <BackdropShape accent={preset.accent} glow={preset.glow} style={preset.backdropStyle} />
        <ellipse cx="60" cy="112" rx="33" ry="7" fill="#1d2430" opacity="0.12" />

        <path d="M50 77h20v15H50z" fill={preset.skinShadow} opacity="0.94" />
        <OutfitShape
          accent={preset.accent}
          innerwear={preset.innerwear}
          outerwear={preset.outerwear}
          style={preset.outfitStyle}
        />

        <ellipse cx="60" cy="59" rx="25" ry="30" fill={preset.skin} />
        <ellipse cx="60" cy="63" rx="21" ry="22" fill={preset.skinShadow} opacity="0.08" />
        <ellipse cx="34" cy="61" rx="4.5" ry="7" fill={preset.skin} />
        <ellipse cx="86" cy="61" rx="4.5" ry="7" fill={preset.skin} />

        <HairShape hair={preset.hair} shine={preset.hairShine} style={preset.hairStyle} />

        <path d="M47 65c1.2 2 3.3 3 6.2 3 2.9 0 5-1 6.2-3" fill="none" opacity="0.28" stroke="#d89787" strokeLinecap="round" strokeWidth="2" />
        <path d="M60 58c-.7 3.4-.6 5.4 2.1 6.4" fill="none" stroke="#d3927f" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="45" cy="66" r="3.7" fill="#f3a6a2" opacity="0.18" />
        <circle cx="75" cy="66" r="3.7" fill="#f3a6a2" opacity="0.18" />
        <Eyes style={preset.eyeStyle} />
        <Mouth style={preset.mouthStyle} />
        <Accessory accent={preset.accent} kind={preset.accessory} />
      </svg>
    </div>
  );
}
