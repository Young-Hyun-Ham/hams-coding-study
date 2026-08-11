"use client";

import type { BeforeMount, OnMount } from "@monaco-editor/react";
import {
  SandpackConsole,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import dynamic from "next/dynamic";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginTypeScript from "prettier/plugins/typescript";
import { format } from "prettier/standalone";
import { useEffect, useState } from "react";
import { useLessonWorkspaceStore } from "@/stores/lesson-workspace-store";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] place-items-center bg-[#1e1e1e] text-sm text-slate-400">
      에디터를 불러오는 중...
    </div>
  ),
});

const configureTypeScript: BeforeMount = (monaco) => {
  const typescript = monaco.languages.typescript;

  typescript.typescriptDefaults.setCompilerOptions({
    allowNonTsExtensions: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    jsx: typescript.JsxEmit.ReactJSX,
    module: typescript.ModuleKind.ESNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    strict: true,
    target: typescript.ScriptTarget.ES2022,
  });

  typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true,
    onlyVisible: true,
  });
};

type Props = {
  lessonId: string;
  starterCode: string;
  solutionCode: string;
};

function ReactEditor({ lessonId, starterCode, solutionCode }: Props) {
  const draft = useLessonWorkspaceStore((state) => state.drafts[lessonId]);
  const setCode = useLessonWorkspaceStore((state) => state.setCode);
  const resetDraft = useLessonWorkspaceStore((state) => state.reset);
  const code = draft ?? starterCode;
  const { sandpack } = useSandpack();
  const { error, runSandpack, status, updateFile } = sandpack;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const handleMount: OnMount = (editor) => editor.focus();

  useEffect(() => {
    if (!isPreviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreviewOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isPreviewOpen]);

  const handleChange = (value: string | undefined) => {
    const nextCode = value ?? "";
    setCode(lessonId, nextCode);
    updateFile("/App.tsx", nextCode, false);
  };

  const handleReset = () => {
    resetDraft(lessonId);
    updateFile("/App.tsx", starterCode, false);
  };

  const handleLoadSolution = async () => {
    setIsFormatting(true);
    let formattedCode = solutionCode;

    try {
      formattedCode = await format(solutionCode, {
        parser: "typescript",
        plugins: [prettierPluginTypeScript, prettierPluginEstree],
        printWidth: 80,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
      });
    } catch {
      formattedCode = solutionCode;
    } finally {
      setCode(lessonId, formattedCode);
      updateFile("/App.tsx", formattedCode, false);
      setIsFormatting(false);
    }
  };

  const handleRun = () => {
    setIsPreviewOpen(true);
    setIsLaunching(true);
    updateFile("/App.tsx", code, true);

    window.requestAnimationFrame(async () => {
      if (status !== "running") {
        await runSandpack();
      }
      setIsLaunching(false);
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`size-2 rounded-full ${error ? "bg-rose-400" : status === "running" ? "bg-emerald-400" : "bg-slate-500"}`} />
          <span className="font-mono text-sm text-slate-300">{lessonId}.tsx</span>
          <span className="rounded bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-300">SANDPACK</span>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={isFormatting} onClick={handleLoadSolution} className="rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-300 transition hover:bg-amber-400/10 disabled:cursor-wait disabled:opacity-50">
            {isFormatting ? "코드 정리 중..." : "예시 풀이 불러오기"}
          </button>
          <button type="button" onClick={handleReset} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800">
            초기화
          </button>
          <button
            type="button"
            disabled={isLaunching || !code.trim()}
            onClick={handleRun}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isLaunching ? "미리보기 여는 중..." : "React 실행"}
          </button>
        </div>
      </header>

          <MonacoEditor
        beforeMount={configureTypeScript}
        height="680px"
        language="typescript"
        path={`/lessons/${lessonId}/App.tsx`}
        theme="vs-dark"
        value={code}
        onChange={handleChange}
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

      <div
        className={`${isPreviewOpen ? "fixed" : "hidden"} inset-0 z-50 grid place-items-center bg-black/75 p-3 backdrop-blur-sm sm:p-6`}
        role="dialog"
        aria-modal="true"
        aria-label="React 실행 결과"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsPreviewOpen(false);
        }}
      >
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <div>
              <h2 className="font-bold text-white">React 실행 결과</h2>
              <p className="mt-1 text-xs text-slate-400">미리보기와 콘솔에서 빌드 결과를 확인하세요.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleRun} disabled={isLaunching} className="rounded-lg border border-cyan-400/30 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-50">
                다시 실행
              </button>
              <button type="button" onClick={() => setIsPreviewOpen(false)} className="grid size-10 place-items-center rounded-lg bg-slate-800 text-xl text-slate-300 hover:bg-slate-700" aria-label="미리보기 닫기">
                ×
              </button>
            </div>
          </header>

          <div className="grid min-h-0 grow lg:grid-cols-[1.4fr_0.6fr]">
            <div className="min-h-[420px] bg-white lg:border-r lg:border-slate-700">
              <SandpackPreview
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
                showSandpackErrorOverlay
                style={{ height: "100%", minHeight: 420 }}
              />
            </div>
            <div className="min-h-0 bg-[#151515]">
              <div className="border-b border-slate-700 px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase">Console</div>
              <SandpackConsole
                showHeader={false}
                showSyntaxError
                showSetupProgress
                resetOnPreviewRestart
                style={{ height: 420 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReactLessonWorkspace(props: Props) {
  return (
    <SandpackProvider
      key={props.lessonId}
      template="react-ts"
      theme="dark"
      files={{
        "/App.tsx": { code: props.starterCode, active: true },
      }}
      customSetup={{
        dependencies: {
          "@tanstack/react-query": "^5.101.4",
          msw: "^2.0.0",
          react: "^19.2.0",
          "react-dom": "^19.2.0",
          "react-router-dom": "^7.0.0",
          zustand: "^5.0.14",
        },
      }}
      options={{
        activeFile: "/App.tsx",
        autorun: false,
        recompileMode: "delayed",
        recompileDelay: 500,
      }}
    >
      <ReactEditor {...props} />
    </SandpackProvider>
  );
}
