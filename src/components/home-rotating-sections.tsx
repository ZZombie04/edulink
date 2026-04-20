"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Clock3, MapPin, School } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { JobVisual } from "@/components/job-visual";

type PoolPreviewItem = {
  avatarPreset: Parameters<typeof CharacterAvatar>[0]["presetId"];
  href: string;
  summary: string;
  tags: string[];
  title: string;
};

type JobPreviewItem = {
  detail: string;
  employmentType: string;
  gradeLevel: string;
  id: string;
  qualificationSubject?: string;
  qualificationType: string;
  schedule: string;
  schoolName: string;
  schoolRegion: string;
  summary: string;
};

function useRotatingIndex(length: number, delay = 4200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, delay);

    return () => {
      window.clearInterval(timer);
    };
  }, [delay, length]);

  return index;
}

function ProgressDots({
  activeIndex,
  count,
}: {
  activeIndex: number;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`h-2 rounded-full transition-all ${
            index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/28"
          }`}
        />
      ))}
    </div>
  );
}

export function RotatingPoolShowcase({
  items,
}: {
  items: PoolPreviewItem[];
}) {
  const activeIndex = useRotatingIndex(items.length);
  const activeItem = items[activeIndex];
  const queuedItems = useMemo(
    () =>
      items
        .filter((_, index) => index !== activeIndex)
        .slice(0, 2),
    [activeIndex, items],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_280px]">
      <div className="relative min-h-[282px] overflow-hidden rounded-[28px] border border-white/10 bg-white/8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.href}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.01 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={activeItem.href}
              className="flex h-full flex-col justify-between gap-6 p-6 sm:p-7"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]" />

              <div className="relative flex items-start gap-4">
                <CharacterAvatar
                  className="h-20 w-20 rounded-[20px]"
                  presetId={activeItem.avatarPreset}
                  size={80}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white/76">
                    실시간 추천 인력풀
                  </div>
                  <div className="mt-2 break-keep text-2xl font-bold text-white sm:text-3xl">
                    {activeItem.title}
                  </div>
                  <p className="mt-3 break-keep text-sm leading-7 text-white/84 sm:text-base">
                    {activeItem.summary}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="flex flex-wrap gap-2">
                  {activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/80">
                    프로필 상세와 매칭 요청 흐름까지 바로 이어집니다.
                  </div>
                  <ProgressDots activeIndex={activeIndex} count={items.length} />
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid gap-3">
        {queuedItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-white/10 bg-white/8 p-4 transition-colors hover:bg-white/12"
          >
            <div className="flex items-center gap-3">
              <CharacterAvatar
                className="h-12 w-12 rounded-xl"
                presetId={item.avatarPreset}
                size={48}
              />
              <div className="min-w-0">
                <div className="break-keep text-sm font-semibold text-white">
                  {item.title}
                </div>
                <div className="mt-1 break-keep text-xs leading-5 text-white/72">
                  {item.tags.join(" · ")}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RotatingJobShowcase({
  items,
}: {
  items: JobPreviewItem[];
}) {
  const activeIndex = useRotatingIndex(items.length, 4600);
  const activeItem = items[activeIndex];
  const queuedItems = useMemo(
    () =>
      items
        .filter((_, index) => index !== activeIndex)
        .slice(0, 2),
    [activeIndex, items],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_300px]">
      <div className="relative min-h-[444px] overflow-hidden rounded-[28px] border border-white/10 bg-white/8 p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            className="absolute inset-0 p-5 sm:p-6"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.01 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/jobs/${activeItem.id}`} className="grid h-full gap-5">
              <JobVisual
                className="min-h-[248px]"
                employmentType={activeItem.employmentType}
                gradeLevel={activeItem.gradeLevel}
                id={activeItem.id}
                qualificationSubject={activeItem.qualificationSubject}
                qualificationType={activeItem.qualificationType}
                schoolName={activeItem.schoolName}
                schoolRegion={activeItem.schoolRegion}
              />

              <div className="grid gap-4 self-end">
                <p className="break-keep text-sm leading-7 text-white/86">
                  {activeItem.summary}
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {activeItem.schoolRegion}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {activeItem.schedule}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {activeItem.detail}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white/80">
                    지원부터 면접 요청까지 더미 흐름이 바로 이어집니다.
                  </div>
                  <ProgressDots activeIndex={activeIndex} count={items.length} />
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid gap-3">
        {queuedItems.map((item) => (
          <Link
            key={item.id}
            href={`/jobs/${item.id}`}
            className="rounded-xl border border-white/10 bg-white/8 p-4 transition-colors hover:bg-white/12"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white">
                <School className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="break-keep text-sm font-semibold text-white">
                  {item.schoolName}
                </div>
                <div className="mt-1 break-keep text-xs leading-5 text-white/72">
                  {item.gradeLevel} · {item.employmentType}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
