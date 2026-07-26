"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  School2,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";

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

function useRotatingIndex(length: number, delay = 5200) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (length <= 1 || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, delay);

    return () => window.clearInterval(timer);
  }, [delay, length, reduceMotion]);

  return [index, setIndex] as const;
}

function CarouselControls({
  activeIndex,
  count,
  label,
  onSelect,
}: {
  activeIndex: number;
  count: number;
  label: string;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}번째 항목 보기`}
          aria-current={index === activeIndex}
          className={`h-8 min-w-8 border px-2 text-xs font-semibold transition-colors ${
            index === activeIndex
              ? "border-primary-700 bg-primary-700 text-white"
              : "border-outline bg-transparent text-ink-muted hover:border-outline-strong hover:text-ink"
          }`}
          onClick={() => onSelect(index)}
        >
          {String(index + 1).padStart(2, "0")}
        </button>
      ))}
    </div>
  );
}

export function RotatingPoolShowcase({
  items,
}: {
  items: PoolPreviewItem[];
}) {
  const [activeIndex, setActiveIndex] = useRotatingIndex(items.length);
  const activeItem = items[activeIndex];
  const queuedItems = useMemo(
    () => items.filter((_, index) => index !== activeIndex),
    [activeIndex, items],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <div className="grid border-y border-outline lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
      <div className="relative min-h-[330px] overflow-hidden border-outline bg-surface-contrast p-6 sm:p-8 lg:border-r">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.href}
            className="flex h-full flex-col justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <div>
              <div className="flex items-start justify-between gap-5">
                <CharacterAvatar
                  className="h-[72px] w-[72px]"
                  presetId={activeItem.avatarPreset}
                  size={72}
                />
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700">
                  자격 검증 프로필
                </span>
              </div>
              <h3 className="mt-8 text-3xl font-bold tracking-[-0.04em] text-ink">
                {activeItem.title}
              </h3>
              <p className="mt-4 max-w-xl break-keep text-sm leading-7 text-ink-soft sm:text-base">
                {activeItem.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-outline pt-4">
                {activeItem.tags.map((tag) => (
                  <span key={tag} className="text-sm font-semibold text-ink-soft">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              <CarouselControls
                activeIndex={activeIndex}
                count={items.length}
                label="추천 교사 선택"
                onSelect={setActiveIndex}
              />
              <Link
                href={activeItem.href}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline"
              >
                프로필 살펴보기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-surface-subtle">
        {queuedItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 border-b border-outline px-5 py-5 transition-colors last:border-b-0 hover:bg-surface-contrast"
          >
            <CharacterAvatar
              className="h-12 w-12"
              presetId={item.avatarPreset}
              size={48}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-ink">{item.title}</div>
              <div className="mt-1 truncate text-xs text-ink-muted">
                {item.tags.join(" · ")}
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-ink-muted" />
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
  const [activeIndex, setActiveIndex] = useRotatingIndex(items.length, 5600);
  const activeItem = items[activeIndex];
  const queuedItems = useMemo(
    () => items.filter((_, index) => index !== activeIndex),
    [activeIndex, items],
  );

  if (!activeItem) {
    return null;
  }

  return (
    <div className="grid border-y border-outline bg-surface-contrast lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <div className="relative min-h-[390px] overflow-hidden border-outline p-6 sm:p-8 lg:border-r">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            className="flex h-full flex-col justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <div>
              <div className="flex items-start justify-between gap-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700">
                  <School2 className="h-4 w-4" />
                  {activeItem.schoolRegion} 채용
                </span>
                <span className="border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  모집 중
                </span>
              </div>
              <h3 className="mt-8 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
                {activeItem.schoolName}
              </h3>
              <p className="mt-2 text-lg font-semibold text-ink-soft">
                {activeItem.gradeLevel}
              </p>
              <p className="mt-5 max-w-2xl break-keep text-sm leading-7 text-ink-soft sm:text-base">
                {activeItem.summary}
              </p>

              <dl className="mt-7 grid border-y border-outline sm:grid-cols-3">
                {[
                  {
                    Icon: BriefcaseBusiness,
                    label: "근무 형태",
                    value: activeItem.employmentType,
                  },
                  {
                    Icon: CalendarDays,
                    label: "근무 기간",
                    value: activeItem.schedule,
                  },
                  {
                    Icon: MapPin,
                    label: "자격·업무",
                    value: `${activeItem.qualificationType}${activeItem.qualificationSubject ? ` ${activeItem.qualificationSubject}` : ""} · ${activeItem.detail}`,
                  },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="border-b border-outline py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0"
                  >
                    <dt className="flex items-center gap-2 text-xs text-ink-muted">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </dt>
                    <dd className="mt-2 text-sm font-semibold leading-6 text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              <CarouselControls
                activeIndex={activeIndex}
                count={items.length}
                label="채용 공고 선택"
                onSelect={setActiveIndex}
              />
              <Link
                href={`/jobs/${activeItem.id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:underline"
              >
                공고 자세히 보기
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-surface-subtle">
        {queuedItems.map((item) => (
          <Link
            key={item.id}
            href={`/jobs/${item.id}`}
            className="block border-b border-outline px-5 py-6 transition-colors last:border-b-0 hover:bg-surface-contrast"
          >
            <div className="flex items-start justify-between gap-3">
              <School2 className="mt-0.5 h-5 w-5 text-primary-600" />
              <ArrowUpRight className="h-4 w-4 text-ink-muted" />
            </div>
            <div className="mt-5 text-sm font-bold text-ink">
              {item.schoolName}
            </div>
            <div className="mt-1 text-xs leading-5 text-ink-muted">
              {item.gradeLevel} · {item.employmentType}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
