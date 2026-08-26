"use client";

import { useSyncExternalStore } from "react";

type MonacoTheme = "vs" | "vs-dark";

function getThemeSnapshot(): MonacoTheme {
  return document.documentElement.dataset.themeResolved === "light"
    ? "vs"
    : "vs-dark";
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme-resolved"],
  });
  return () => observer.disconnect();
}

export function useMonacoTheme() {
  return useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "vs-dark",
  );
}
