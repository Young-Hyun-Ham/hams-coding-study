import Link from "next/link";
import { languages } from "@/lib/study-data";

const accentStyles = {
  sky: { badge: "bg-sky-400/10 text-sky-300 ring-sky-400/20", glow: "group-hover:border-sky-400/50" },
  amber: { badge: "bg-amber-400/10 text-amber-300 ring-amber-400/20", glow: "group-hover:border-amber-400/50" },
  cyan: { badge: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20", glow: "group-hover:border-cyan-400/50" },
  orange: { badge: "bg-orange-400/10 text-orange-300 ring-orange-400/20", glow: "group-hover:border-orange-400/50" },
  violet: { badge: "bg-violet-400/10 text-violet-300 ring-violet-400/20", glow: "group-hover:border-violet-400/50" },
  emerald: { badge: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20", glow: "group-hover:border-emerald-400/50" },
  rose: { badge: "bg-rose-400/10 text-rose-300 ring-rose-400/20", glow: "group-hover:border-rose-400/50" },
  indigo: { badge: "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20", glow: "group-hover:border-indigo-400/50" },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <header className="max-w-3xl">
          <p className="text-sm font-bold tracking-[0.2em] text-sky-400 uppercase">Hams Coding Study</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            기초부터 실전까지,<br />160일 동안 완성하세요.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            배우고 싶은 언어를 선택하세요. 40일 기본 과정과 심화 60일, 프로젝트 60일로 구성된 학습 코스를 제공합니다.
          </p>
        </header>

        <section className="mt-12" aria-labelledby="courses-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="courses-heading" className="text-2xl font-bold">언어별 스터디</h2>
              <p className="mt-1 text-sm text-slate-500">{languages.length}개 과정 · 총 {languages.reduce((total, language) => total + language.courseLength, 0)}개 학습</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-800">하루 30–60분</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {languages.map((language) => {
              const styles = accentStyles[language.accent];
              return (
                <Link
                  key={language.slug}
                  href={`/studies/${language.slug}`}
                  className={`group flex min-h-64 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition duration-200 hover:-translate-y-1 hover:bg-slate-900 ${styles.glow}`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid size-14 place-items-center rounded-2xl font-mono text-lg font-black ring-1 ${styles.badge}`}>
                      {language.shortName}
                    </span>
                    <span className="text-2xl text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden>→</span>
                  </div>
                  <h3 className="mt-7 text-2xl font-bold">{language.name}</h3>
                  <p className="mt-2 grow text-sm leading-6 text-slate-400">{language.description}</p>
                  <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span>{language.courseLength}일 코스</span><span>·</span><span>심화 60 + 프로젝트 60</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
