"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { LanguageSlug } from "@/lib/types";
import { getCurrentUser } from "./auth-query";
import styles from "./cloud-lesson-controls.module.css";

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
  const clickPoint = useRef({ x: 0, y: 0 });
  const [snackbar, setSnackbar] = useState<{
    message: string;
    x: number;
    y: number;
    tone: "success" | "error";
  } | null>(null);
  const { data: user } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const showSnackbar = (message: string, tone: "success" | "error") => {
    setSnackbar({ message, tone, ...clickPoint.current });
  };

  const save = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/study-progress", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, language, day, code, stdin }),
      });
      if (!response.ok) throw new Error(await readError(response));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["last-study"] });
      showSnackbar("저장 완료", "success");
    },
    onError: () => showSnackbar("저장 실패", "error"),
  });
  const load = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/study-progress?lessonId=${encodeURIComponent(lessonId)}`,
      );
      if (!response.ok) throw new Error(await readError(response));
      return (await response.json()).lesson as { code: string; stdin: string };
    },
    onSuccess: (content) => {
      onLoad(content);
      showSnackbar("불러오기 완료", "success");
    },
    onError: (error) =>
      showSnackbar(
        error.message === "saved_lesson_not_found"
          ? "저장된 학습 내용이 없습니다."
          : "불러오기 실패",
        "error",
      ),
  });

  useEffect(() => {
    if (!snackbar) return;
    const timer = window.setTimeout(() => setSnackbar(null), 1000);
    return () => window.clearTimeout(timer);
  }, [snackbar]);

  if (!user) return null;

  const rememberClick = (event: MouseEvent<HTMLButtonElement>) => {
    clickPoint.current = {
      x: Math.min(Math.max(event.clientX, 90), window.innerWidth - 90),
      y: event.clientY - 10,
    };
  };

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
      <button
        type="button"
        onClick={(event) => {
          rememberClick(event);
          save.mutate();
        }}
        disabled={save.isPending || !code.trim()}
        className="rounded-md border border-emerald-400/40 px-2 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-50"
      >
        {save.isPending ? "저장 중..." : "학습내용저장"}
      </button>
      <button
        type="button"
        onClick={(event) => {
          rememberClick(event);
          load.mutate();
        }}
        disabled={load.isPending}
        className="rounded-md border border-sky-400/40 px-2 py-1.5 text-xs text-sky-300 transition hover:bg-sky-400/10 disabled:opacity-50"
      >
        {load.isPending ? "불러오는 중..." : "저장된학습내용불러오기"}
      </button>
      {snackbar && (
        <span
          className={`${styles.snackbar} ${styles[snackbar.tone]}`}
          style={{ left: snackbar.x, top: snackbar.y }}
          role="status"
        >
          {snackbar.message}
        </span>
      )}
    </div>
  );
}
