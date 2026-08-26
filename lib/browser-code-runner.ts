import { runPython } from "@/lib/pyodide-runner";
import { LanguageSlug } from "./types";

export type CodeExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

let cRuntimePromise: ReturnType<typeof createCRuntime> | undefined;

function runJavaScript(
  code: string,
  stdin: string,
): Promise<CodeExecutionResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker("/javascript-worker.mjs", { type: "module" });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("JavaScript 실행 시간이 5초를 초과해 중단했습니다."));
    }, 5_000);

    worker.onmessage = (event: MessageEvent<CodeExecutionResult>) => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(
        new Error(
          event.message || "JavaScript Worker 실행 중 오류가 발생했습니다.",
        ),
      );
    };
    worker.postMessage({ code, stdin });
  });
}

async function createCRuntime() {
  const { createEmception } = await import("@gameguild/emception-browser");
  return createEmception({
    manifestUrl:
      "https://cdn.jsdelivr.net/npm/emception@3.8.0/cdn/manifest.json",
    tty: "none",
  });
}

async function runC(code: string, stdin: string): Promise<CodeExecutionResult> {
  cRuntimePromise ??= createCRuntime();
  const runtime = await cRuntimePromise;
  const { compileAndRun } = await import("@gameguild/emception-browser");
  const result = await compileAndRun(runtime, {
    preset: "c",
    source: code,
    stdin,
    paths: {
      sourcePath: "/home/user/main.c",
      objectPath: "/home/user/main.o",
      wasmPath: "/home/user/main.wasm",
    },
  });

  const phases = [result.compile, result.link, result.run].filter(
    (phase) => phase !== undefined,
  );
  return {
    stdout: phases
      .map((phase) => phase.stdout)
      .filter(Boolean)
      .join("\n"),
    stderr: phases
      .map((phase) => phase.stderr)
      .filter(Boolean)
      .join("\n"),
    exitCode: result.exitCode,
  };
}

async function runCSharp(code: string): Promise<CodeExecutionResult> {
  const { BrowserCSharp } = await import("browser-csharp");
  const ready = await new Promise<boolean>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("C# 런타임 준비 시간이 초과되었습니다.")),
      30_000,
    );
    BrowserCSharp.OnReady((success) => {
      window.clearTimeout(timeout);
      resolve(success);
    });
  });
  if (!ready) throw new Error("C# WebAssembly 런타임을 불러오지 못했습니다.");

  const result = await BrowserCSharp.ExecuteScript(code);
  return {
    stdout: [result.stdOut, result.result == null ? "" : String(result.result)]
      .filter(Boolean)
      .join("\n"),
    stderr: result.stdErr,
    exitCode: result.stdErr ? 1 : 0,
  };
}

export function canRunInBrowser(language: LanguageSlug) {
  return (
    language === "python" ||
    language === "javascript" ||
    language === "c" ||
    language === "csharp"
  );
}

export async function runBrowserCode(input: {
  language: LanguageSlug;
  code: string;
  stdin: string;
}): Promise<CodeExecutionResult> {
  if (input.language === "python")
    return runPython({ code: input.code, stdin: input.stdin });
  if (input.language === "javascript")
    return runJavaScript(input.code, input.stdin);
  if (input.language === "c") return runC(input.code, input.stdin);
  if (input.language === "csharp") return runCSharp(input.code);
  throw new Error(
    `${input.language} 과정은 아직 브라우저 실행을 지원하지 않습니다.`,
  );
}
