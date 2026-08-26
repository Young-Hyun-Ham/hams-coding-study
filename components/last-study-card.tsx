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

async function getLastLesson(): Promise<LastLesson | null> {
  const response = await fetch("/api/study-progress");
  if (!response.ok) throw new Error("마지막 학습 내용을 불러오지 못했습니다.");
  return (await response.json()).lastLesson;
}

export function LastStudyCard() {
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["last-study"],
    queryFn: getLastLesson,
    enabled: Boolean(user),
  });

  if (!user) return null;

  return (
    <section className="mt-10 rounded-2xl border border-sky-400/20 bg-slate-900/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-xs font-bold tracking-[.14em] text-sky-400 uppercase">
          Continue Learning
        </p>
        {isLoading ? (
          <p className="mt-2 text-sm text-slate-400">
            마지막 학습 내용을 확인하고 있습니다...
          </p>
        ) : lesson ? (
          <>
            <h2 className="mt-2 text-xl font-bold">
              {lesson.languageName} · Day {lesson.day}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{lesson.title}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            아직 기록된 학습 내용이 없습니다.
          </p>
        )}
      </div>
      {lesson && (
        <Link
          href={`/studies/${lesson.language}/${lesson.day}`}
          className="mt-4 inline-flex rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 sm:mt-0"
        >
          바로 이동 →
        </Link>
      )}
    </section>
  );
}
