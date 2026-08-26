"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getCurrentUser } from "./auth-query";

type LastLesson = {
  language: string;
  languageName: string;
  day: number;
  title: string;
};

async function getLastLessons(): Promise<LastLesson[]> {
  const response = await fetch("/api/study-progress");
  if (!response.ok) throw new Error("마지막 학습 내용을 불러오지 못했습니다.");
  return (await response.json()).lastLessons ?? [];
}

export function LastStudyCard() {
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["last-study"],
    queryFn: getLastLessons,
    enabled: Boolean(user),
  });

  if (!user) return null;

  return (
    <section className="mt-8 rounded-2xl border border-sky-400/20 bg-slate-900/70 p-4 sm:p-5">
      <div className={lessons?.length ? "mb-4" : ""}>
        <p className="text-[10px] font-bold tracking-[.14em] text-sky-400 uppercase sm:text-xs">
          Continue Learning
        </p>
        {isLoading ? (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            마지막 학습 내용을 확인하고 있습니다...
          </p>
        ) : !lessons?.length ? (
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            아직 기록된 학습 내용이 없습니다.
          </p>
        ) : null}
      </div>

      {!!lessons?.length && (
        <div className="grid gap-2 md:grid-cols-2">
          {lessons.map((lesson) => (
            <article
              key={lesson.language}
              className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:gap-3 sm:p-4"
            >
              <div className="min-w-0">
                <h2 className="truncate text-xs font-bold sm:text-base">
                  {lesson.languageName} · Day {lesson.day}
                </h2>
                <p className="mt-1 truncate text-[10px] text-slate-400 sm:text-sm">
                  {lesson.title}
                </p>
              </div>
              <Link
                href={`/studies/${lesson.language}/${lesson.day}`}
                className="inline-flex shrink-0 rounded-lg bg-sky-400 px-2.5 py-2 text-[10px] font-bold text-slate-950 transition hover:bg-sky-300 sm:px-4 sm:text-sm"
              >
                바로 이동 →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
