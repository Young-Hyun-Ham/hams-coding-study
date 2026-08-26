export type SessionUser = {
  id: string;
  email: string;
  loginId: string;
  nickname: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("사용자 정보를 불러오지 못했습니다.");
  return (await response.json()).user;
}
