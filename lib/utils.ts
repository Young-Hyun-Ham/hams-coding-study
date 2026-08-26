import { LanguageSlug } from "./types";

export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getWorkerName(language: LanguageSlug) {
  let worker;
  switch (language) {
    case "python":
      worker = "Pyodide";
      break;
    case "c":
      worker = "Clang";
      break;
    case "csharp":
      worker = "C#";
      break;
    case "javascript":
      worker = "Node";
      break;
    default:
      worker = "Browser";
  }
  return worker;
}
