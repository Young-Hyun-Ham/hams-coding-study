const formatValue = (value) => {
  if (typeof value === "string") return value;
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "function") return value.toString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

self.onmessage = async (event) => {
  const { code, stdin = "" } = event.data ?? {};
  const stdout = [];
  const stderr = [];
  const inputLines = String(stdin).split(/\r?\n/);
  let inputIndex = 0;

  const consoleProxy = {
    log: (...values) => stdout.push(values.map(formatValue).join(" ")),
    info: (...values) => stdout.push(values.map(formatValue).join(" ")),
    warn: (...values) => stderr.push(values.map(formatValue).join(" ")),
    error: (...values) => stderr.push(values.map(formatValue).join(" ")),
    debug: (...values) => stdout.push(values.map(formatValue).join(" ")),
  };

  const prompt = () => inputLines[inputIndex++] ?? "";

  try {
    const execute = new Function(
      "console",
      "prompt",
      `"use strict"; return (async () => {\n${String(code)}\n})();`,
    );
    await execute(consoleProxy, prompt);
    self.postMessage({ stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode: 0 });
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    stderr.push(message);
    self.postMessage({ stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode: 1 });
  }
};
