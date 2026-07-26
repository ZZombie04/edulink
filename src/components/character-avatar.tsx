import Image from "next/image";

import { getAvatarPreset, type AvatarPresetId } from "@/lib/avatar-presets";
import { cn } from "@/lib/utils";

const avatarSources: Record<AvatarPresetId, string> = {
  "teacher-f-rose": "/avatars/teacher-kim-haeun.png",
  "teacher-f-mint": "/avatars/teacher-park-seoyeon.png",
  "teacher-f-violet": "/avatars/teacher-choi-minjeong.png",
  "teacher-f-sky": "/avatars/teacher-jeong-woojin.png",
  "teacher-m-navy": "/avatars/teacher-lee-junho.png",
  "teacher-m-amber": "/avatars/teacher-jeong-woojin.png",
  "teacher-m-forest": "/avatars/teacher-jeong-woojin.png",
  "teacher-m-plum": "/avatars/teacher-lee-junho.png",
  "teacher-n-cloud": "/avatars/teacher-kim-haeun.png",
  "teacher-n-coral": "/avatars/teacher-choi-minjeong.png",
  "teacher-c-lime": "/avatars/teacher-park-seoyeon.png",
  "teacher-c-indigo": "/avatars/teacher-lee-junho.png",
  "teacher-c-cocoa": "/avatars/teacher-kim-haeun.png",
  "teacher-c-aqua": "/avatars/teacher-jeong-woojin.png",
  "teacher-c-sunset": "/avatars/teacher-choi-minjeong.png",
  "teacher-c-olive": "/avatars/teacher-park-seoyeon.png",
};

export function CharacterAvatar({
  presetId,
  className,
  priority = false,
  size = 64,
}: {
  presetId?: AvatarPresetId;
  className?: string;
  priority?: boolean;
  size?: number;
}) {
  const preset = getAvatarPreset(presetId);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-black/5 bg-surface-panel",
        className,
      )}
      style={{ height: size, width: size }}
    >
      <Image
        alt={`${preset.name} 교사 프로필 사진`}
        className="object-cover"
        fill
        priority={priority}
        sizes={`${size}px`}
        src={avatarSources[preset.id]}
      />
    </span>
  );
}
