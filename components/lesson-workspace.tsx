"use client";

import type { OnMount } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { runPython } from "@/lib/pyodide-runner";
import type { LanguageSlug } from "@/lib/study-data";
import { useLessonWorkspaceStore } from "@/stores/lesson-workspace-store";

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
  const code = draft ?? starterCode;
  const canExecute = language === "python";
  const execution = useMutation({
    mutationFn: (input: { code: string; stdin: string }) => runPython(input),
  });
  const handleMount: OnMount = (editor) => editor.focus();

  const output = execution.isPending
    ? "Pyodide를 준비하고 Python 코드를 실행하고 있습니다..."
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
          <span className="font-mono text-sm text-slate-300">{lessonId}.{language === "python" || language === "python-langgraph" ? "py" : language === "java" ? "java" : language === "kotlin" ? "kt" : "tsx"}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setCode(lessonId, solutionCode); execution.reset(); }}
            className="rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-300 transition hover:bg-amber-400/10"
          >
            예시 풀이 불러오기
          </button>
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
        <label className="border-b border-slate-800 p-4 md:border-r md:border-b-0">
          <span className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">표준 입력</span>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(lessonId, event.target.value)}
            disabled={!canExecute}
            placeholder={canExecute ? "input()으로 읽을 값을 줄 단위로 입력하세요." : "Python 실행 과정에서 사용할 수 있습니다."}
            className="h-28 w-full resize-none rounded-lg bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none ring-sky-500 focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>
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
