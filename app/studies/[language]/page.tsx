import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LastLearnedDay } from "@/components/study-progress";
import { getCurriculum, getLanguage, languages } from "@/lib/study-data";
import { Lesson } from "@/lib/types";

type PageProps = { params: Promise<{ language: string }> };

const levelLabels: Record<Lesson["level"], string> = {
  beginner: "입문",
  elementary: "기초",
  intermediate: "중급",
  advanced: "심화",
  project: "프로젝트",
};

export function generateStaticParams() {
  return languages.map(({ slug }) => ({ language: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const language = getLanguage((await params).language);
  return language
    ? { title: `${language.name} ${language.courseLength}일 코스 | HAMS Coding Study`, description: language.description }
    : {};
}

export default async function StudyPage({ params }: PageProps) {
  const language = getLanguage((await params).language);
  if (!language) notFound();

  const lessons = getCurriculum(language.slug);
  const stageNumbers = [...new Set(lessons.map((lesson) => lesson.stage))].sort((a, b) => a - b);
  const stages = stageNumbers.map((number) => ({
    number,
    lessons: lessons.filter((lesson) => lesson.stage === number),
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <span aria-hidden>←</span> 모든 스터디
        </Link>

        <header className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-7 sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-sky-400 uppercase">{language.courseLength} Day Curriculum</p>
              <h1 className="mt-3 text-4xl font-bold">{language.name} 스터디</h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-400">{language.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-950 px-5 py-3"><strong className="block text-xl">{language.courseLength}</strong><span className="text-xs text-slate-500">학습 총 수</span></div>
              <div className="rounded-xl bg-slate-950 px-5 py-3"><LastLearnedDay language={language.slug} /><span className="text-xs text-slate-500">마지막 학습</span></div>
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-10 mt-8 overflow-x-auto border-y border-slate-800 bg-slate-950/90 py-3 backdrop-blur" aria-label="학습 단계">
          <div className="flex min-w-max gap-2">
            {stages.map(({ number, lessons: stageLessons }) => (
              <a key={number} href={`#stage-${number}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">
                {number}단계 · {stageLessons[0].stageName}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-10 space-y-14">
          {stages.map(({ number, lessons: stageLessons }) => (
            <section key={number} id={`stage-${number}`} className="scroll-mt-20">
              <div className="mb-5 flex items-end justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-bold text-sky-400">STAGE {number}</p>
                  <h2 className="mt-1 text-2xl font-bold">{stageLessons[0].stageName}</h2>
                </div>
                <span className="text-sm text-slate-500">Day {stageLessons[0].day}–{stageLessons.at(-1)?.day}</span>
              </div>

              <ol className="grid gap-3 md:grid-cols-2">
                {stageLessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={`/studies/${language.slug}/${lesson.day}`} className="group block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-slate-900">
                    <div className="flex gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-950 font-mono text-sm font-bold text-sky-400">{String(lesson.day).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-100">{lesson.title}</h3>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{levelLabels[lesson.level]}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{lesson.summary}</p>
                        <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-600">
                          <span>예상 {lesson.estimatedMinutes}분</span>
                          <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-sky-400">학습하기 →</span>
                        </div>
                      </div>
                    </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
