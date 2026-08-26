"use client";

import type { BeforeMount } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import {
  SandpackConsole,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { formatCode } from "@/lib/code-formatter";
import { useLessonWorkspaceStore } from "@/stores/lesson-workspace-store";
import { CloudLessonControls } from "@/components/cloud-lesson-controls";
import { getLessonFileName } from "@/lib/utils";
import { useMonacoTheme } from "@/components/use-monaco-theme";
import { getCurrentUser } from "@/components/auth-query";
import { CommonModal } from "@/components/common-modal";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] place-items-center bg-slate-950 text-sm text-slate-400">
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
  day: number;
  starterCode: string;
  solutionCode: string;
};

function ReactEditor({ lessonId, day, starterCode, solutionCode }: Props) {
  const monacoTheme = useMonacoTheme();
  const workspaceRef = useRef<HTMLElement>(null);
  const draft = useLessonWorkspaceStore((state) => state.drafts[lessonId]);
  const setCode = useLessonWorkspaceStore((state) => state.setCode);
  const resetDraft = useLessonWorkspaceStore((state) => state.reset);
  const code = draft ?? starterCode;
  const [copyMode, setCopyMode] = useState<"single-line" | "original">(
    "original",
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const { sandpack } = useSandpack();
  const { error, runSandpack, status, updateFile } = sandpack;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  useLayoutEffect(() => {
    const frames = workspaceRef.current?.querySelectorAll("iframe");
    frames?.forEach((frame) => frame.setAttribute("credentialless", ""));
  }, []);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPreviewOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPreviewOpen]);

  const handleCopyCode = async () => {
    const textToCopy =
      copyMode === "single-line"
        ? code
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" ")
        : code;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 1500);
  };

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
    const formattedCode = await formatCode("react", solutionCode);
    setCode(lessonId, formattedCode);
    updateFile("/App.tsx", formattedCode, false);
    setIsFormatting(false);
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

  const handleRunRequest = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    handleRun();
  };

  return (
    <section
      ref={workspaceRef}
      className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
    >
      <header className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-800 px-3 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`size-2 rounded-full ${error ? "bg-rose-400" : status === "running" ? "bg-emerald-400" : "bg-slate-500"}`}
          />
          <span
            className="font-mono text-xs text-slate-300"
            title={`${lessonId}.tsx`}
          >
            {getLessonFileName(lessonId, "tsx")}
          </span>
          {/*
          <span className="rounded bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-300">
            SANDPACK
          </span>
          */}
        </div>
        <div className="ml-auto flex shrink-0 flex-nowrap justify-end gap-1.5">
          <button
            type="button"
            disabled={isLaunching || !code.trim()}
            onClick={handleRunRequest}
            className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isLaunching ? "미리보기 여는 중..." : "React 실행"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-700 px-2 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
          >
            초기화
          </button>
          <button
            type="button"
            disabled={isFormatting}
            onClick={handleLoadSolution}
            className="rounded-md border border-amber-400/30 px-2 py-1.5 text-xs text-amber-300 transition hover:bg-amber-400/10 disabled:cursor-wait disabled:opacity-50"
          >
            {isFormatting ? "코드 정리 중..." : "예시 풀이 불러오기"}
          </button>
          <CloudLessonControls
            lessonId={lessonId}
            language="react"
            day={day}
            code={code}
            onLoad={(content) => {
              setCode(lessonId, content.code);
              updateFile("/App.tsx", content.code, false);
            }}
          />
          <div className="flex items-center gap-2">
            <div
              className="inline-flex overflow-hidden rounded-md border border-slate-700 bg-slate-950 p-0.5"
              role="group"
              aria-label="코드 복사 형식"
            >
              <button
                type="button"
                aria-pressed={copyMode === "single-line"}
                onClick={() => setCopyMode("single-line")}
                className={`rounded px-2 py-1 text-[10px] font-bold transition ${copyMode === "single-line" ? "bg-sky-400 text-slate-950 shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
              >
                한 줄 복사
              </button>
              <button
                type="button"
                aria-pressed={copyMode === "original"}
                onClick={() => setCopyMode("original")}
                className={`rounded px-2 py-1 text-[10px] font-bold transition ${copyMode === "original" ? "bg-sky-400 text-slate-950 shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
              >
                원본 복사
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!code}
              title={
                copyStatus === "copied"
                  ? "복사했습니다"
                  : copyStatus === "error"
                    ? "복사하지 못했습니다"
                    : "현재 코드 복사"
              }
              aria-label={
                copyStatus === "copied" ? "복사 완료" : "현재 코드 복사"
              }
              className={`grid size-7 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${copyStatus === "copied" ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : copyStatus === "error" ? "border-rose-400/50 text-rose-300" : "border-slate-700 text-slate-400 hover:border-sky-400/50 hover:text-sky-300"}`}
            >
              {copyStatus === "copied" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="8" y="8" width="11" height="11" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="h-[480px] w-full sm:h-[680px]">
        <MonacoEditor
          beforeMount={configureTypeScript}
          height="100%"
          language="typescript"
          path={`/lessons/${lessonId}/App.tsx`}
          theme={monacoTheme}
          value={code}
          onChange={handleChange}
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
      </div>

      <div
        className={`${isPreviewOpen ? "fixed" : "hidden"} inset-0 z-[100] grid place-items-center bg-black/75 px-4 py-5 backdrop-blur-sm sm:p-6`}
        role="dialog"
        aria-modal="true"
        aria-label="React 실행 결과"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsPreviewOpen(false);
        }}
      >
        <div className="flex max-h-[calc(100dvh-2.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl sm:max-h-[92vh]">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-700 px-3 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-white sm:text-base">
                React 실행 결과
              </h2>
              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                미리보기와 콘솔에서 빌드 결과를 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunRequest}
                disabled={isLaunching}
                className="rounded-lg border border-cyan-400/30 px-2.5 py-2 text-xs text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-50 sm:px-3 sm:text-sm"
              >
                다시 실행
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="grid size-9 place-items-center rounded-lg bg-slate-800 text-lg text-slate-300 hover:bg-slate-700 sm:size-10 sm:text-xl"
                aria-label="미리보기 닫기"
              >
                ×
              </button>
            </div>
          </header>

          <div className="min-h-0 grow overflow-y-auto lg:grid lg:grid-cols-[1.4fr_0.6fr] lg:overflow-hidden">
            <div className="h-[min(52dvh,420px)] min-h-[300px] bg-slate-950 lg:h-auto lg:min-h-[420px] lg:border-r lg:border-slate-700">
              <SandpackPreview
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
                showSandpackErrorOverlay
                style={{ height: "100%" }}
              />
            </div>
            <div className="h-80 min-h-0 bg-slate-950 lg:h-auto">
              <div className="border-b border-slate-700 px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Console
              </div>
              <SandpackConsole
                showHeader={false}
                showSyntaxError
                showSetupProgress
                resetOnPreviewRestart
                style={{ height: "calc(100% - 41px)" }}
              />
            </div>
          </div>
        </div>
      </div>
      <CommonModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        title="로그인이 필요한 기능이에요"
        description="React 코드 실행은 HAMS 계정으로 로그인한 사용자만 이용할 수 있습니다."
        prompt="로그인 페이지로 이동하시겠습니까?"
        confirmHref={`/login?returnTo=${encodeURIComponent(`/studies/react/${day}`)}`}
      />
    </section>
  );
}

export function ReactLessonWorkspace(props: Props) {
  const monacoTheme = useMonacoTheme();
  const sandpackTheme = monacoTheme === "vs" ? "light" : "dark";

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <SandpackProvider
        key={props.lessonId}
        template="react-ts"
        theme={sandpackTheme}
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
    </div>
  );
}
