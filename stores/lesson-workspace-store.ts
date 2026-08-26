import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceState = {
  drafts: Record<string, string>;
  stdinByLesson: Record<string, string>;
  setCode: (lessonId: string, code: string) => void;
  setStdin: (lessonId: string, stdin: string) => void;
  reset: (lessonId: string) => void;
};

export const useLessonWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      drafts: {},
      stdinByLesson: {},
      setCode: (lessonId, code) =>
        set((state) => ({ drafts: { ...state.drafts, [lessonId]: code } })),
      setStdin: (lessonId, stdin) =>
        set((state) => ({
          stdinByLesson: { ...state.stdinByLesson, [lessonId]: stdin },
        })),
      reset: (lessonId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          const stdinByLesson = { ...state.stdinByLesson };
          delete drafts[lessonId];
          delete stdinByLesson[lessonId];
          return { drafts, stdinByLesson };
        }),
    }),
    { name: "hams-study-workspaces-v3" },
  ),
);
