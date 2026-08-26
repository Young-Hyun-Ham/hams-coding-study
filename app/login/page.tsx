import Link from "next/link";
import styles from "./page.module.css";

const errorMessages: Record<string, string> = {
  sso_state: "로그인 요청을 확인할 수 없습니다. 다시 시도해 주세요.",
  sso_exchange: "인증 정보를 가져오지 못했습니다. 다시 시도해 주세요.",
};

function normalizeReturnTo(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = normalizeReturnTo(params.returnTo);
  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <section className={styles.card}>
        <Link className={styles.brand} href="/">
          <span>HCS</span>
          <strong>
            HAMS <b>Coding Study</b>
          </strong>
        </Link>
        <div className={styles.badge}>HAMS SSO</div>
        <h1>
          반가워요.
          <br />
          계속하려면 로그인하세요.
        </h1>
        <p>
          {params.error
            ? (errorMessages[params.error] ?? "로그인을 완료하지 못했습니다.")
            : "하나의 HAMS 계정으로 안전하게 연결됩니다. 문서는 로그인하지 않아도 계속 이용할 수 있어요."}
        </p>
        <a
          className={styles.loginButton}
          href={`/api/sso/login?returnTo=${encodeURIComponent(returnTo)}`}
        >
          <span className={styles.buttonMark}>HCS</span>HAMS 계정으로 계속하기{" "}
          <b>→</b>
        </a>
        <Link className={styles.guestLink} href={returnTo}>
          로그인 없이 둘러보기
        </Link>
        <small>
          로그인하면 HAMS의 통합 인증 정책 및 개인정보 처리방침에 동의하게
          됩니다.
        </small>
      </section>
    </main>
  );
}
