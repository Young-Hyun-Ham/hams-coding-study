import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginTypeScript from "prettier/plugins/typescript";
import { format } from "prettier/standalone";
import { LanguageSlug } from "./types";

function formatPython(code: string) {
  return code
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^(\s*)((?:async\s+)?def|class|if|elif|else|for|while|try|except|finally|with)\b([^:]*):\s+(.+)$/);
      if (!match) return [line];
      const [, indent, keyword, condition, body] = match;
      return [`${indent}${keyword}${condition}:`, `${indent}    ${body}`];
    })
    .flatMap((line) => splitOutsideStrings(line, ";"))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function splitOutsideStrings(value: string, separator: string) {
  const parts: string[] = [];
  const indent = value.slice(0, value.length - value.trimStart().length);
  let current = "";
  let quote = "";
  let escaped = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && quote) {
      current += character;
      escaped = true;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = quote === character ? "" : quote || character;
      current += character;
      continue;
    }
    if (!quote && character === separator) {
      if (current.trim()) parts.push(`${indent}${current.trim()}`);
      current = "";
      continue;
    }
    current += character;
  }

  if (current.trim()) parts.push(`${indent}${current.trim()}`);
  return parts.filter((part) => part.trim());
}

function formatBraceLanguage(code: string) {
  const lines: string[] = [];
  let current = "";
  let indent = 0;
  let quote = "";
  let escaped = false;
  let parentheses = 0;

  const flush = () => {
    const text = current.trim();
    if (text) lines.push(`${"  ".repeat(Math.max(indent, 0))}${text}`);
    current = "";
  };

  for (const character of code.replace(/\r?\n/g, " ")) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === "\\" && quote) {
      current += character;
      escaped = true;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = quote === character ? "" : quote || character;
      current += character;
      continue;
    }
    if (quote) {
      current += character;
      continue;
    }
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses -= 1;
    if (character === "{") {
      current = `${current.trimEnd()} {`;
      flush();
      indent += 1;
    } else if (character === "}") {
      flush();
      indent -= 1;
      lines.push(`${"  ".repeat(Math.max(indent, 0))}}`);
    } else if (character === ";" && parentheses === 0) {
      current = `${current.trimEnd()};`;
      flush();
    } else {
      current += character;
    }
  }
  flush();
  return lines.join("\n").replace(/}\n\s*else/g, "} else").trimEnd();
}

export async function formatCode(language: LanguageSlug, code: string) {
  if (!code.trim()) return code;

  try {
    if (language === "javascript" || language === "react") {
      return await format(code, {
        parser: "typescript",
        plugins: [prettierPluginTypeScript, prettierPluginEstree],
        printWidth: 80,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
      });
    }
    if (language === "python" || language === "python-langgraph") return formatPython(code);
    if (language === "c" || language === "csharp") return code.trimEnd();
    if (language === "java" || language === "kotlin") return formatBraceLanguage(code);
  } catch {
    return code;
  }

  return code;
}
