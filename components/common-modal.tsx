"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./common-modal.module.css";

type CommonModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  prompt?: ReactNode;
  eyebrow?: string;
  confirmHref: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function CommonModal({
  open,
  onClose,
  title,
  description,
  prompt,
  eyebrow = "MEMBERS ONLY",
  confirmHref,
  confirmLabel = "로그인 페이지로 이동",
  cancelLabel = "취소",
}: CommonModalProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.icon} aria-hidden="true">
          HCS
        </div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <div className={styles.description}>{description}</div>
        {prompt && <strong className={styles.prompt}>{prompt}</strong>}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            {cancelLabel}
          </button>
          <Link ref={confirmRef} href={confirmHref}>
            {confirmLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
