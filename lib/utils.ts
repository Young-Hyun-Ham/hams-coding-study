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

export function getLessonFileName(lessonId: string, extension: string) {
  const shortId = Array.from(lessonId).slice(0, 18).join("");
  const shortExtension = Array.from(extension.replace(/^\./, ""))
    .slice(0, 10)
    .join("");
  return `${shortId}.${shortExtension}`;
}
