"use client";

import type { OnMount } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { formatCode } from "@/lib/code-formatter";
import { canRunInBrowser, runBrowserCode } from "@/lib/browser-code-runner";
import { useLessonWorkspaceStore } from "@/stores/lesson-workspace-store";
import { capitalize, getWorkerName } from "@/lib/utils";
import { LanguageSlug } from "@/lib/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="grid h-[480px] place-items-center bg-[#1e1e1e] text-sm text-slate-400">에디터를 불러오는 중...</div>,
});

const monacoLanguages: Record<LanguageSlug, string> = {
  python: "python",
  javascript: "javascript",
  react: "typescript",
  java: "java",
  kotlin: "kotlin",
  "python-langgraph": "python",
  c: "c",
  csharp: "csharp",
};

type Props = {
  lessonId: string;
  language: LanguageSlug;
  starterCode: string;
  solutionCode: string;
};

export function LessonWorkspace({ lessonId, language, starterCode, solutionCode }: Props) {
  const draft = useLessonWorkspaceStore((state) => state.drafts[lessonId]);
  const stdin = useLessonWorkspaceStore((state) => state.stdinByLesson[lessonId] ?? "");
  const setCode = useLessonWorkspaceStore((state) => state.setCode);
  const setStdin = useLessonWorkspaceStore((state) => state.setStdin);
  const resetDraft = useLessonWorkspaceStore((state) => state.reset);
  const [copyMode, setCopyMode] = useState<"single-line" | "original">("original");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isFormatting, setIsFormatting] = useState(false);
  const code = draft ?? starterCode;
  const canExecute = canRunInBrowser(language);
  const acceptsStdin = language === "python" || language === "javascript" || language === "c";
  const execution = useMutation({
    mutationFn: (input: { code: string; stdin: string }) => runBrowserCode({ language, ...input }),
  });
  const handleMount: OnMount = (editor) => editor.focus();

  const handleLoadSolution = async () => {
    setIsFormatting(true);
    const formattedCode = await formatCode(language, solutionCode);
    setCode(lessonId, formattedCode);
    execution.reset();
    setIsFormatting(false);
  };

  const handleCopyCode = async () => {
    const textToCopy = copyMode === "single-line"
      ? code.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(" ")
      : code;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 1500);
  };

  const handleMakeStdinSingleLine = () => {
    let singleLine = stdin;

    try {
      singleLine = JSON.stringify(JSON.parse(stdin));
    } catch {
      singleLine = stdin
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ");
    }

    setStdin(lessonId, singleLine);
  };
  const output = execution.isPending
    ? `${getWorkerName(language)}를 준비하고 ${capitalize(language)} 코드를 실행하고 있습니다...`
    : execution.isError
      ? execution.error.message
      : execution.data
        ? [execution.data.stdout, execution.data.stderr].filter(Boolean).join("\n") || "(출력 없음)"
        : canExecute
          ? "코드를 실행하면 결과가 여기에 표시됩니다."
          : `${language.toUpperCase()} 과정은 현재 코드 작성 모드입니다. 브라우저 실행은 Python 과정에서 지원합니다.`;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-sm text-slate-300">{lessonId}.{language === "python" || language === "python-langgraph" ? "py" : language === "java" ? "java" : language === "kotlin" ? "kt" : language === "c" ? "c" : language === "csharp" ? "csx" : "tsx"}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLoadSolution}
            disabled={isFormatting}
            className="rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-300 transition hover:bg-amber-400/10"
          >
            {isFormatting ? "코드 정리 중..." : "예시 풀이 불러오기"}
          </button>
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-700 bg-slate-950 p-0.5" role="group" aria-label="코드 복사 형식">
              <button
                type="button"
                aria-pressed={copyMode === "single-line"}
                onClick={() => setCopyMode("single-line")}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${copyMode === "single-line" ? "bg-sky-400 text-slate-950 shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
              >
                한 줄 복사
              </button>
              <button
                type="button"
                aria-pressed={copyMode === "original"}
                onClick={() => setCopyMode("original")}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${copyMode === "original" ? "bg-sky-400 text-slate-950 shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
              >
                원본 복사
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!code}
              title={copyStatus === "copied" ? "복사했습니다" : copyStatus === "error" ? "복사하지 못했습니다" : "현재 코드 복사"}
              aria-label={copyStatus === "copied" ? "복사 완료" : "현재 코드 복사"}
              className={`grid size-8 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${copyStatus === "copied" ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : copyStatus === "error" ? "border-rose-400/50 text-rose-300" : "border-slate-700 text-slate-400 hover:border-sky-400/50 hover:text-sky-300"}`}
            >
              {copyStatus === "copied" ? (
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => { resetDraft(lessonId); execution.reset(); }}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            초기화
          </button>
          <button
            type="button"
            disabled={!canExecute || execution.isPending || !code.trim()}
            onClick={() => execution.mutate({ code, stdin })}
            title={canExecute ? "코드 실행" : "현재 Python 과정만 브라우저 실행을 지원합니다."}
            className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {execution.isPending ? "실행 중..." : canExecute ? "코드 실행" : "실행 준비 중"}
          </button>
        </div>
      </header>

      <MonacoEditor
        height="480px"
        language={monacoLanguages[language]}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(lessonId, value ?? "")}
        onMount={handleMount}
        options={{
          automaticLayout: true,
          fontSize: 15,
          lineHeight: 24,
          minimap: { enabled: false },
          padding: { top: 18 },
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
      />

      <div className="grid border-t border-slate-800 md:grid-cols-2">
        <div className="border-b border-slate-800 p-4 md:border-r md:border-b-0">
          <div className="mb-2 flex min-h-8 items-center justify-between gap-2">
            <label htmlFor={`${lessonId}-stdin`} className="text-xs font-bold tracking-wider text-slate-500 uppercase">표준 입력</label>
            <button
              type="button"
              onClick={handleMakeStdinSingleLine}
              disabled={!acceptsStdin || !stdin.trim()}
              title="표준 입력의 개행과 들여쓰기를 제거합니다"
              className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              한 줄 처리
            </button>
          </div>
          <textarea
            id={`${lessonId}-stdin`}
            value={stdin}
            onChange={(event) => setStdin(lessonId, event.target.value)}
            disabled={!acceptsStdin}
            placeholder={acceptsStdin ? "표준 입력으로 읽을 값을 줄 단위로 입력하세요." : "이 실행 환경에서는 표준 입력을 사용하지 않습니다."}
            className="h-28 w-full resize-none rounded-lg bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none ring-sky-500 focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="p-4" aria-live="polite">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">실행 결과</span>
            {execution.data && <span className="text-xs text-emerald-400">exit {execution.data.exitCode}</span>}
          </div>
          <pre className={`h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-sm ${execution.isError || execution.data?.stderr ? "text-rose-300" : "text-slate-300"}`}>{output}</pre>
        </div>
      </div>
    </section>
  );
}
