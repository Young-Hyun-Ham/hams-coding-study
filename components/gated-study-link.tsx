"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { getCurrentUser } from "./auth-query";
import styles from "./gated-study-link.module.css";

type GatedStudyLinkProps = {
  href: string;
  className?: string;
  requiresLogin: boolean;
  autoOpen?: boolean;
  children: ReactNode;
};

export function GatedStudyLink({
  href,
  className,
  requiresLogin,
  autoOpen = false,
  children,
}: GatedStudyLinkProps) {
  const [modalOpen, setModalOpen] = useState(requiresLogin && autoOpen);
  const titleId = useId();
  const confirmRef = useRef<HTMLAnchorElement>(null);
  const { data: user, isLoading } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
    enabled: requiresLogin,
  });

  const loginHref = `/login?returnTo=${encodeURIComponent(href)}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!requiresLogin || user) return;
    event.preventDefault();
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [modalOpen]);

  return (
    <>
      <Link
        href={href}
        className={className}
        onClick={handleClick}
        aria-busy={requiresLogin && isLoading}
      >
        {children}
      </Link>

      {modalOpen && (
        <div
          className={styles.backdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className={styles.icon} aria-hidden>
              HCS
            </div>
            <p className={styles.eyebrow}>MEMBERS ONLY</p>
            <h2 id={titleId}>로그인이 필요한 학습이에요.</h2>
            <p>
              심화 및 프로젝트 코스는 HAMS 계정으로 로그인한 후 이용할 수
              있습니다.
            </p>
            <strong>로그인 페이지로 이동하시겠습니까?</strong>
            <div className={styles.actions}>
              <button type="button" onClick={() => setModalOpen(false)}>
                취소
              </button>
              <Link ref={confirmRef} href={loginHref}>
                로그인 페이지로 이동
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
