export type PyodideResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

type WorkerResponse = {
  id: number;
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
};

let worker: Worker | null = null;
let requestId = 0;

function getWorker() {
  worker ??= new Worker("/pyodide-worker.mjs", { type: "module" });
  return worker;
}

function disposeWorker() {
  worker?.terminate();
  worker = null;
}

export function runPython(
  { code, stdin }: { code: string; stdin: string },
  timeoutMs = 30_000,
): Promise<PyodideResult> {
  const activeWorker = getWorker();
  const id = ++requestId;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      activeWorker.removeEventListener("message", handleMessage);
      activeWorker.removeEventListener("error", handleWorkerError);
    };

    const handleMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      cleanup();

      if (!event.data.ok) {
        reject(new Error(event.data.error ?? event.data.stderr ?? "Python 실행에 실패했습니다."));
        return;
      }

      resolve({
        stdout: event.data.stdout,
        stderr: event.data.stderr,
        exitCode: 0,
      });
    };

    const handleWorkerError = () => {
      cleanup();
      disposeWorker();
      reject(new Error("Pyodide 런타임을 불러오지 못했습니다. 네트워크 연결을 확인해 주세요."));
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      disposeWorker();
      reject(new Error("실행 제한 시간(30초)을 초과하여 Python 실행을 중단했습니다."));
    }, timeoutMs);

    activeWorker.addEventListener("message", handleMessage);
    activeWorker.addEventListener("error", handleWorkerError);
    activeWorker.postMessage({ id, code, stdin });
  });
}
