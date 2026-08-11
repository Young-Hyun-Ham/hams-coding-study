import { loadPyodide } from "https://cdn.jsdelivr.net/npm/pyodide@314.0.3/pyodide.mjs";

const pyodideReady = loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/npm/pyodide@314.0.3/",
});

self.onmessage = async ({ data }) => {
  const { id, code, stdin } = data;
  const stdout = [];
  const stderr = [];

  try {
    const pyodide = await pyodideReady;
    const inputLines = stdin.split(/\r?\n/);
    let inputIndex = 0;

    pyodide.setStdin({
      stdin: () => inputLines[inputIndex++] ?? null,
      isatty: false,
    });
    pyodide.setStdout({ batched: (text) => stdout.push(text) });
    pyodide.setStderr({ batched: (text) => stderr.push(text) });

    await pyodide.loadPackagesFromImports(code);
    const globals = pyodide.globals.get("dict")();

    try {
      await pyodide.runPythonAsync(code, { globals });
    } finally {
      globals.destroy();
    }

    self.postMessage({
      id,
      ok: true,
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
    });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      stdout: stdout.join("\n"),
      stderr: stderr.join("\n"),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
