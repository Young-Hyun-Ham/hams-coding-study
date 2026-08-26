"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "./auth-query";
import type { LanguageSlug } from "@/lib/types";

type Props = {
  lessonId: string;
  language: LanguageSlug;
  day: number;
  code: string;
  stdin?: string;
  onLoad: (content: { code: string; stdin: string }) => void;
};

async function readError(response: Response) {
  const result = await response.json().catch(() => null);
  return result?.error ?? "요청을 처리하지 못했습니다.";
}

export function CloudLessonControls({
  lessonId,
  language,
  day,
  code,
  stdin = "",
  onLoad,
}: Props) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });
  const save = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/study-progress", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, language, day, code, stdin }),
      });
      if (!response.ok) throw new Error(await readError(response));
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["last-study"] }),
  });
  const load = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/study-progress?lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!response.ok) throw new Error(await readError(response));
      return (await response.json()).lesson as { code: string; stdin: string };
    },
    onSuccess: onLoad,
  });

  if (!user) return null;
  const message = save.isError
    ? "저장 실패"
    : save.isSuccess
      ? "저장 완료"
      : load.isError
        ? load.error.message === "saved_lesson_not_found"
          ? "저장 내용 없음"
          : "불러오기 실패"
        : load.isSuccess
          ? "불러오기 완료"
          : null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite">
      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending || !code.trim()}
        className="rounded-lg border border-emerald-400/40 px-3 py-2 text-sm text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-50"
      >
        {save.isPending ? "저장 중..." : "학습내용저장"}
      </button>
      <button
        type="button"
        onClick={() => load.mutate()}
        disabled={load.isPending}
        className="rounded-lg border border-sky-400/40 px-3 py-2 text-sm text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-50"
      >
        {load.isPending ? "불러오는 중..." : "저장된학습내용불러오기"}
      </button>
      {message && <span className="text-xs text-slate-400">{message}</span>}
    </div>
  );
}
