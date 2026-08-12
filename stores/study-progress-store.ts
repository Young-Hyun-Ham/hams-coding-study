import { LanguageSlug } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type StudyProgressState = {
  lastLearnedDayByLanguage: Partial<Record<LanguageSlug, number>>;
  recordLesson: (language: LanguageSlug, day: number) => void;
};

export const useStudyProgressStore = create<StudyProgressState>()(persist((set) => ({
  lastLearnedDayByLanguage: {},
  recordLesson: (language, day) =>
    set((state) => ({
      lastLearnedDayByLanguage: {
        ...state.lastLearnedDayByLanguage,
        [language]: day,
      },
    })),
}), { name: "hams-study-progress-v1" }));
