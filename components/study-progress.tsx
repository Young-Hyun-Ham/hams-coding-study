"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useStudyProgressStore } from "@/stores/study-progress-store";
import { LanguageSlug } from "@/lib/types";

export function RecordLessonProgress({ language, day }: { language: LanguageSlug; day: number }) {
  const recordLesson = useStudyProgressStore((state) => state.recordLesson);

  useEffect(() => {
    recordLesson(language, day);
  }, [day, language, recordLesson]);

  return null;
}

export function LastLearnedDay({ language }: { language: LanguageSlug }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const lastLearnedDay = useStudyProgressStore((state) => state.lastLearnedDayByLanguage[language]);

  return <strong className="block text-xl">{hydrated && lastLearnedDay ? `Day ${lastLearnedDay}` : "-"}</strong>;
}
