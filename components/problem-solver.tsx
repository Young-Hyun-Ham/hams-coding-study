"use client";

import { useMutation } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { runPython } from "@/lib/pyodide-runner";
import { useSolutionStore } from "@/stores/solution-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] place-items-center bg-slate-950 text-sm text-slate-400">
      에디터를 불러오는 중...
    </div>
  ),
});

export function ProblemSolver() {
  const { code, stdin, setCode, setStdin, reset } = useSolutionStore();
  const execution = useMutation({
    mutationFn: (input: { code: string; stdin: string }) => runPython(input),
  });

  const output = execution.isPending
    ? "Python 코드를 실행하고 있습니다..."
    : execution.isError
      ? execution.error.message
      : execution.data
        ? [execution.data.stdout, execution.data.stderr]
            .filter(Boolean)
            .join("\n") || "(출력 없음)"
        : "실행 결과가 여기에 표시됩니다.";

  return (
    <section className="grid min-h-[680px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-sky-950/30 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
      <article className="border-b border-slate-800 p-6 lg:border-r lg:border-b-0 lg:p-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-sky-400 uppercase">
          <span className="size-2 rounded-full bg-sky-400" /> Python · Pyodide ·
          Easy
        </div>
        <h1 className="text-2xl font-bold text-white">배열의 합 구하기</h1>
        <p className="mt-4 leading-7 text-slate-300">
          정수 배열{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sky-300">
            numbers
          </code>
          가 주어질 때 모든 원소의 합을 반환하세요.
        </p>
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Example
          </p>
          <pre className="mt-3 overflow-x-auto text-sm leading-7 text-slate-300">
            입력 [1, 2, 3, 4]{"\n"}출력 10
          </pre>
        </div>
      </article>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <span className="text-sm font-medium text-slate-300">main.py</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                execution.reset();
              }}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              초기화
            </button>
            <button
              type="button"
              disabled={execution.isPending || !code.trim()}
              onClick={() => execution.mutate({ code, stdin })}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {execution.isPending ? "실행 중..." : "코드 실행"}
            </button>
          </div>
        </header>

        <MonacoEditor
          height="420px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            padding: { top: 18 },
            automaticLayout: true,
          }}
        />

        <div className="grid border-t border-slate-800 md:grid-cols-2">
          <label className="border-b border-slate-800 p-4 md:border-r md:border-b-0">
            <span className="mb-2 block text-xs font-semibold text-slate-500 uppercase">
              표준 입력 (stdin)
            </span>
            <textarea
              value={stdin}
              onChange={(event) => setStdin(event.target.value)}
              placeholder="input()으로 읽을 값을 입력하세요."
              className="h-28 w-full resize-none rounded-lg bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none ring-sky-500 focus:ring-1"
            />
          </label>
          <div className="p-4" aria-live="polite">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                실행 결과
              </span>
              {execution.data && (
                <span
                  className={
                    execution.data.exitCode === 0
                      ? "text-xs text-emerald-400"
                      : "text-xs text-rose-400"
                  }
                >
                  exit {execution.data.exitCode}
                </span>
              )}
            </div>
            <pre
              className={`h-28 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-sm ${execution.isError || execution.data?.stderr ? "text-rose-300" : "text-slate-200"}`}
            >
              {output}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
