"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import { getCurrentUser } from "./auth-query";
import { CommonModal } from "./common-modal";

type ProtectedStudyLinkProps = {
  href: string;
  className?: string;
  requiresLogin: boolean;
  autoOpen?: boolean;
  children: ReactNode;
};

export function ProtectedStudyLink({
  href,
  className,
  requiresLogin,
  autoOpen = false,
  children,
}: ProtectedStudyLinkProps) {
  const [modalOpen, setModalOpen] = useState(requiresLogin && autoOpen);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const { data: user, isLoading } = useQuery({
    queryKey: ["session-user"],
    queryFn: getCurrentUser,
    retry: false,
    enabled: requiresLogin,
  });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!requiresLogin || user) return;
    event.preventDefault();
    setModalOpen(true);
  };

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
      <CommonModal
        open={modalOpen}
        onClose={closeModal}
        title="로그인이 필요한 학습이에요"
        description="심화 및 프로젝트 코스는 HAMS 계정으로 로그인한 후 이용할 수 있습니다."
        prompt="로그인 페이지로 이동하시겠습니까?"
        confirmHref={`/login?returnTo=${encodeURIComponent(href)}`}
      />
    </>
  );
}
