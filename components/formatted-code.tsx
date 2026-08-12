"use client";

import { useEffect, useState } from "react";
import { formatCode } from "@/lib/code-formatter";
import { LanguageSlug } from "@/lib/types";

export function FormattedCode({ language, code }: { language: LanguageSlug; code: string }) {
  const [formattedCode, setFormattedCode] = useState(code);

  useEffect(() => {
    let active = true;
    void formatCode(language, code).then((result) => {
      if (active) setFormattedCode(result);
    });
    return () => { active = false; };
  }, [code, language]);

  return <pre className="max-h-80 overflow-auto whitespace-pre rounded-lg bg-black/40 p-4 font-mono text-xs leading-6 text-slate-300"><code>{formattedCode}</code></pre>;
}
