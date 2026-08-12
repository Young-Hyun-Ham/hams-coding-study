"use client";

import { useEffect } from "react";

export function CSharpRuntimeLoader() {
  useEffect(() => {
    void import("browser-csharp").then(() => {
      if (document.getElementById("browser-csharp-runtime")) return;
      const script = document.createElement("script");
      script.id = "browser-csharp-runtime";
      script.src = "/_framework/blazor.webassembly.js";
      script.async = true;
      document.head.appendChild(script);
    });
  }, []);

  return null;
}
