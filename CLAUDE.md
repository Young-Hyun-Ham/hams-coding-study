@AGENTS.md

# Claude project notes

작업을 시작할 때 `AGENTS.md` 전체와 관련 소스 파일을 먼저 읽는다. 이 서비스의 실제 기준은 다음과 같다.

- 8개 언어 과정, 과정별 160일, 총 1,280개 학습 데이터
- 브라우저 실행: Python, JavaScript, React, C, C#
- 작성·저장 전용: Java, Kotlin, Python LangGraph
- 로컬 초안: Zustand persist
- 서버 상태: TanStack Query
- 사용자 인증: HAMS SSO
- 클라우드 저장: Next.js Route Handler + Firebase Admin/Firestore

커리큘럼 JSON을 직접 수정하기 전에 생성 스크립트가 같은 값을 다시 만드는지 확인한다. 사용자 기능을 변경한 작업은 `HISTORY.md`에도 기록하고, 완료 전 `pnpm lint`와 `pnpm build`를 실행한다. 환경 변수와 인증 토큰은 출력하거나 클라이언트 코드로 이동하지 않는다.
