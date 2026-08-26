"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./floating-stage-menu.module.css";

type Props = {
  stages: number[];
};

export function FloatingStageMenu({ stages }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const moveTo = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <div
        className={`${styles.menu} ${open ? styles.open : ""}`}
        aria-hidden={!open}
      >
        {stages.toReversed().map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => moveTo(`stage-${stage}`)}
            tabIndex={open ? 0 : -1}
          >
            <span>{stage}</span>
            <strong>{stage}단계</strong>
          </button>
        ))}
        <button
          type="button"
          onClick={() => moveTo("study-page-top")}
          tabIndex={open ? 0 : -1}
        >
          <span aria-hidden>↑</span>
          <strong>맨 위로</strong>
        </button>
      </div>

      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "단계 이동 메뉴 닫기" : "단계 이동 메뉴 열기"}
        aria-expanded={open}
      >
        <span aria-hidden>+</span>
      </button>
    </div>
  );
}
