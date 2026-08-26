"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useStudyProgressStore } from "@/stores/study-progress-store";
import { LanguageSlug } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "./auth-query";

export function RecordLessonProgress({
  language,
  day,
}: {
  language: LanguageSlug;
  day: number;
}) {
  const recordLesson = useStudyProgressStore((state) => state.recordLesson);
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    recordLesson(language, day);
  }, [day, language, recordLesson]);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/study-progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language, day }),
    }).then((response) => {
      if (response.ok)
        void queryClient.invalidateQueries({ queryKey: ["last-study"] });
    });
  }, [day, language, queryClient, user]);

  return null;
}

export function LastLearnedDay({ language }: { language: LanguageSlug }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const lastLearnedDay = useStudyProgressStore(
    (state) => state.lastLearnedDayByLanguage[language],
  );

  return (
    <strong className="block text-xl">
      {hydrated && lastLearnedDay ? `Day ${lastLearnedDay}` : "-"}
    </strong>
  );
}
