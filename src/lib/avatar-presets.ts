export const avatarPresets = [
  {
    id: "teacher-f-rose",
    gender: "female",
    name: "로즈",
    description: "차분한 인상의 단발 캐릭터",
    backgroundFrom: "#ffe1ef",
    backgroundTo: "#ffd4dd",
    skin: "#f3c7a6",
    hair: "#5a3642",
    shirt: "#d85c7b",
    accent: "#ffd8e3",
    hairStyle: "bob",
    accessory: "clip",
  },
  {
    id: "teacher-f-mint",
    gender: "female",
    name: "민트",
    description: "밝은 긴 머리 캐릭터",
    backgroundFrom: "#d9fff3",
    backgroundTo: "#d4f3ff",
    skin: "#f2c4a0",
    hair: "#314f63",
    shirt: "#28b49d",
    accent: "#f8fff9",
    hairStyle: "long",
    accessory: "none",
  },
  {
    id: "teacher-f-violet",
    gender: "female",
    name: "바이올렛",
    description: "번 헤어와 또렷한 분위기",
    backgroundFrom: "#efe3ff",
    backgroundTo: "#dcd7ff",
    skin: "#f0c9aa",
    hair: "#483561",
    shirt: "#7a63d9",
    accent: "#f8f3ff",
    hairStyle: "bun",
    accessory: "earring",
  },
  {
    id: "teacher-f-sky",
    gender: "female",
    name: "스카이",
    description: "포니테일의 활동적인 캐릭터",
    backgroundFrom: "#d8ecff",
    backgroundTo: "#d7f7ff",
    skin: "#efc6a2",
    hair: "#3c445e",
    shirt: "#4f88f2",
    accent: "#eef8ff",
    hairStyle: "pony",
    accessory: "star",
  },
  {
    id: "teacher-m-navy",
    gender: "male",
    name: "네이비",
    description: "정갈한 짧은 머리 캐릭터",
    backgroundFrom: "#d9e7ff",
    backgroundTo: "#cfe0ff",
    skin: "#efc59d",
    hair: "#27354a",
    shirt: "#426db7",
    accent: "#eff6ff",
    hairStyle: "crop",
    accessory: "none",
  },
  {
    id: "teacher-m-amber",
    gender: "male",
    name: "앰버",
    description: "따뜻한 톤의 캐주얼 캐릭터",
    backgroundFrom: "#ffe8c7",
    backgroundTo: "#fff0d8",
    skin: "#eec09b",
    hair: "#5d3e2a",
    shirt: "#d9822b",
    accent: "#fff7ea",
    hairStyle: "side",
    accessory: "glasses",
  },
  {
    id: "teacher-m-forest",
    gender: "male",
    name: "포레스트",
    description: "차분한 녹색 계열 캐릭터",
    backgroundFrom: "#d6f4db",
    backgroundTo: "#e1ffef",
    skin: "#efc7a5",
    hair: "#2f4337",
    shirt: "#2d8a53",
    accent: "#f4fff6",
    hairStyle: "parted",
    accessory: "none",
  },
  {
    id: "teacher-m-plum",
    gender: "male",
    name: "플럼",
    description: "웨이브 헤어의 부드러운 캐릭터",
    backgroundFrom: "#ecdfff",
    backgroundTo: "#f8e7ff",
    skin: "#efc7a8",
    hair: "#4c3558",
    shirt: "#8d5acf",
    accent: "#f9f0ff",
    hairStyle: "wave",
    accessory: "star",
  },
  {
    id: "teacher-n-cloud",
    gender: "neutral",
    name: "클라우드",
    description: "성별 공개 없이 쓰기 좋은 중성 캐릭터",
    backgroundFrom: "#e4eef8",
    backgroundTo: "#edf6ff",
    skin: "#efc8a7",
    hair: "#4b5664",
    shirt: "#70889f",
    accent: "#ffffff",
    hairStyle: "soft",
    accessory: "none",
  },
  {
    id: "teacher-n-coral",
    gender: "neutral",
    name: "코랄",
    description: "밝고 친근한 표정의 캐릭터",
    backgroundFrom: "#ffe2d8",
    backgroundTo: "#fff0ea",
    skin: "#f0c7a6",
    hair: "#5d4851",
    shirt: "#ea7458",
    accent: "#fff8f5",
    hairStyle: "round",
    accessory: "clip",
  },
] as const;

export type AvatarPreset = (typeof avatarPresets)[number];
export type AvatarPresetId = AvatarPreset["id"];
export type AvatarGender = AvatarPreset["gender"];

export const defaultAvatarPresetByGender: Record<AvatarGender, AvatarPresetId> = {
  female: "teacher-f-rose",
  male: "teacher-m-navy",
  neutral: "teacher-n-cloud",
};

export function getAvatarPreset(presetId?: AvatarPresetId) {
  if (!presetId) {
    return avatarPresets[0];
  }

  return (
    avatarPresets.find((preset) => preset.id === presetId) ?? avatarPresets[0]
  );
}

export function getAvatarPresetsByGender(gender: AvatarGender) {
  return avatarPresets.filter((preset) => preset.gender === gender);
}

export const avatarGenderLabels: Record<AvatarGender, string> = {
  female: "여성",
  male: "남성",
  neutral: "공개 안 함",
};
