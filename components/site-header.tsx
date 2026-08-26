"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "./auth-query";
import styles from "./site-header.module.css";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themeResolved = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function SiteHeader() {
  const [theme, setTheme] = useState<Theme>("system");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: user, isLoading } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("hcs-theme") as Theme | null;
    const selected =
      saved && ["light", "dark", "system"].includes(saved) ? saved : "system";
    // The server cannot read localStorage; update after hydration to keep the initial markup stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(selected);
    applyTheme(selected);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => theme === "system" && applyTheme("system");
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, [theme]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const selectTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("hcs-theme", nextTheme);
    applyTheme(nextTheme);
  };

  const initials = (user?.nickname || user?.loginId || user?.email || "H")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          <span>HCS</span>
          <strong>
            HAMS <b>Codding Study</b>
          </strong>
        </Link>

        <div className={styles.actions}>
          <div className={styles.themePicker} aria-label="테마 선택">
            {(["light", "dark", "system"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={theme === item ? styles.activeTheme : undefined}
                onClick={() => selectTheme(item)}
                aria-pressed={theme === item}
                title={
                  { light: "라이트", dark: "다크", system: "시스템" }[item]
                }
              >
                <span aria-hidden>
                  {item === "light" ? "☀" : item === "dark" ? "☾" : "◐"}
                </span>
                <span className={styles.themeLabel}>
                  {{ light: "라이트", dark: "다크", system: "시스템" }[item]}
                </span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div
              className={styles.userSkeleton}
              aria-label="로그인 정보 확인 중"
            />
          ) : user ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                type="button"
                className={styles.userButton}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
              >
                <span className={styles.avatar}>{initials}</span>
                <span className={styles.userSummary}>
                  <strong>{user.nickname || user.loginId}</strong>
                  <small>{user.email}</small>
                </span>
                <span className={styles.chevron} aria-hidden>
                  ⌄
                </span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.profile}>
                    <span className={styles.avatar}>{initials}</span>
                    <div>
                      <strong>{user.nickname || user.loginId}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <a className={styles.logout} href="/api/auth/logout">
                    로그아웃
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link className={styles.login} href="/login">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
