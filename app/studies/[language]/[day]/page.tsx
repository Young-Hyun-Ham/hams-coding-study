import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonWorkspace } from "@/components/lesson-workspace";
import { ReactLessonWorkspace } from "@/components/react-lesson-workspace";
import { FormattedCode } from "@/components/formatted-code";
import { RecordLessonProgress } from "@/components/study-progress";
import { getAllLessons, getCurriculum, getLanguage, getLesson } from "@/lib/study-data";

type PageProps = { params: Promise<{ language: string; day: string }> };

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({
    language: lesson.language,
    day: String(lesson.day),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language: slug, day: dayParam } = await params;
  const language = getLanguage(slug);
  const lesson = language ? getLesson(language.slug, Number(dayParam)) : undefined;
  return lesson && language
    ? { title: `Day ${lesson.day}. ${lesson.title} | ${language.name} 스터디`, description: lesson.summary }
    : {};
}

export default async function LessonPage({ params }: PageProps) {
  const { language: slug, day: dayParam } = await params;
  const language = getLanguage(slug);
  const day = Number(dayParam);
  const lesson = language && Number.isInteger(day) ? getLesson(language.slug, day) : undefined;
  if (!language || !lesson) notFound();

  const curriculum = getCurriculum(language.slug);
  const previous = curriculum.find((item) => item.day === day - 1);
  const next = curriculum.find((item) => item.day === day + 1);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <RecordLessonProgress language={language.slug} day={lesson.day} />
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link href="/" className="font-bold text-sky-400">HAMS</Link>
            <span className="text-slate-700">/</span>
            <Link href={`/studies/${language.slug}`} className="truncate text-slate-400 transition hover:text-white">{language.name} {language.courseLength}일 코스</Link>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300">Day {lesson.day}</span>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400 ring-1 ring-slate-800">
            Stage {lesson.stage} · {lesson.stageName}
          </span>
        </header>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(300px,0.62fr)_minmax(0,1.38fr)]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:sticky xl:top-6">
            <p className="text-xs font-bold tracking-[0.18em] text-sky-400 uppercase">Day {String(lesson.day).padStart(2, "0")} · {lesson.estimatedMinutes}분</p>
            <h1 className="mt-3 text-2xl font-bold leading-tight">{lesson.title}</h1>
            <p className="mt-4 leading-7 text-slate-400">{lesson.summary}</p>

            <section className="mt-7 border-t border-slate-800 pt-6">
              <h2 className="text-sm font-bold text-slate-200">학습 목표</h2>
              <ul className="mt-4 space-y-3">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-3 text-sm leading-6 text-slate-400">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-400" />{objective}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-7 rounded-xl bg-slate-950 p-5 ring-1 ring-slate-800">
              <h2 className="text-sm font-bold text-slate-200">오늘의 실습</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {lesson.practice.prompt}
              </p>

              <details className="group mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-sky-300 marker:content-none">
                  <span><strong>{lesson.title}</strong> 자세히 알아보기</span>
                  <span className="text-lg text-slate-500 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <div className="border-t border-slate-800 px-4 py-4">
                  <p className="text-sm leading-7 text-slate-400">{lesson.detailedExplanation}</p>
                  <h3 className="mt-5 text-xs font-bold tracking-wider text-slate-300 uppercase">핵심 포인트</h3>
                  <ul className="mt-3 space-y-2">
                    {lesson.keyPoints.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-6 text-slate-400">
                        <span className="text-sky-400">✓</span>{point}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>

              <details className="group mt-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-slate-300 marker:content-none">
                  <span>예시 풀이 코드 보기</span>
                  <span className="text-lg text-slate-500 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <div className="border-t border-slate-800 p-3">
                  <p className="mb-3 text-xs leading-5 text-amber-300/80">먼저 직접 풀어본 다음 예시 풀이와 비교해 보세요.</p>
                  <FormattedCode language={language.slug} code={lesson.practice.solutionCode} />
                </div>
              </details>
            </section>

            {language.slug !== "python" && language.slug !== "react" && language.slug !== "c" && language.slug !== "csharp" && (
              <p className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200/80">
                현재 브라우저 코드 실행은 순수 Python/Pyodide 과정에서 지원합니다. LangGraph를 포함한 외부 런타임 과정은 Monaco 코드 작성과 자동 저장 상태를 제공합니다.
              </p>
            )}
          </aside>

          {language.slug === "react" ? (
            <ReactLessonWorkspace
              lessonId={lesson.id}
              starterCode={lesson.practice.starterCode}
              solutionCode={lesson.practice.solutionCode}
            />
          ) : (
            <LessonWorkspace
              lessonId={lesson.id}
              language={language.slug}
              starterCode={lesson.practice.starterCode}
              solutionCode={lesson.practice.solutionCode}
            />
          )}
        </div>

        <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="이전 및 다음 학습">
          {previous ? (
            <Link href={`/studies/${language.slug}/${previous.day}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700">
              <span className="text-xs text-slate-500">← 이전 학습</span><strong className="mt-1 block text-sm">Day {previous.day}. {previous.title}</strong>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`/studies/${language.slug}/${next.day}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-right transition hover:border-sky-500/40">
              <span className="text-xs text-slate-500">다음 학습 →</span><strong className="mt-1 block text-sm">Day {next.day}. {next.title}</strong>
            </Link>
          ) : (
            <Link href={`/studies/${language.slug}`} className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-right text-emerald-300">{language.courseLength}일 과정 완료 · 목록으로 →</Link>
          )}
        </nav>
      </div>
    </main>
  );
}
