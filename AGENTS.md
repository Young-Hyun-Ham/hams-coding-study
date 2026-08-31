<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HAMS Coding Study repository guide

이 문서는 이 저장소를 수정하는 코딩 에이전트와 기여자가 따라야 할 프로젝트 규칙이다. 사용자 요청이 이 문서보다 우선한다.

## 프로젝트 기준 정보

- Next.js 16 App Router, React 19, TypeScript, pnpm 프로젝트다.
- 과정은 Python, JavaScript, React, Java, C, C#, Kotlin, Python LangGraph의 8개다.
- 각 과정은 기본 40일 + 심화 60일 + 프로젝트 60일, 총 160일이다.
- 과정 메타데이터는 `db/languages.json`, 학습 데이터는 `db/curricula/*.json`이 런타임 원본이다.
- 브라우저 실행 지원은 Python, JavaScript, React, C, C#이다. Java, Kotlin, LangGraph를 실행 가능하다고 문서화하거나 UI에 표시하지 않는다.

## 변경 전 확인

1. 관련 App Router 파일과 컴포넌트, 데이터 타입을 먼저 읽는다.
2. Next.js 동작을 변경할 때는 위 자동 생성 규칙에 따라 `node_modules/next/dist/docs/`의 해당 문서를 확인한다.
3. `git status --short`로 사용자 변경을 확인하고 관계없는 파일을 되돌리지 않는다.
4. UI 문구와 커리큘럼은 UTF-8 한국어를 유지한다.

## 아키텍처 경계

- Server Component를 기본으로 유지하고 브라우저 API, 상태, 이벤트가 필요한 최소 경계에만 `"use client"`를 둔다.
- 서버 상태는 TanStack Query, 로컬 편집 상태는 Zustand, 영속 사용자 데이터는 `/api/study-progress`와 Firestore가 담당한다.
- Firebase Admin은 `lib/firebase-admin.ts`처럼 server-only 모듈에서만 사용한다.
- SSO 처리는 `@hams-fam/sso-client`의 얇은 Route Handler adapter로 유지한다. Secret이나 access token을 Client Component, 응답 본문, Zustand 또는 로그에 노출하지 않는다.
- 일반 언어 편집기는 `components/lesson-workspace.tsx`, React 실행기는 `components/react-lesson-workspace.tsx`에 있다. 중복 UI를 추가하기 전에 기존 공통 컴포넌트를 확인한다.
- 브라우저 실행 라우팅은 `lib/browser-code-runner.ts`에서 관리한다. 긴 작업은 UI 스레드가 아니라 Worker/WASM 경계를 유지한다.

## 커리큘럼 데이터 규칙

- `pnpm db:generate`는 과정별 JSON 전체를 덮어쓴다.
- 지속되어야 하는 데이터 변경은 `scripts/generate-curriculum.mjs` 및 연결된 explanation/solution/extension 모듈을 먼저 수정한 뒤 JSON을 재생성한다.
- 각 과정은 정확히 160개이며 `day`는 1부터 160까지 연속이어야 한다.
- `Lesson` 구조는 `lib/types.ts`를 따른다. 설명은 개념의 정의와 역할을 먼저 제공하고 학습 방법만 반복하지 않는다.
- 시작 코드와 예시 풀이는 해당 일차 주제와 일치해야 하며 React 예시는 Sandpack의 `react-ts` 템플릿에서 실행 가능해야 한다.

## 런타임별 주의사항

- Python: Pyodide가 CDN에서 로드된다. `input()`은 표준 입력을 줄 단위로 소비한다.
- JavaScript: Worker의 실행 제한과 격리를 제거하지 않는다.
- React: Monaco는 편집기이고 실제 빌드/런타임 진단은 Sandpack이 담당한다. Monaco의 React 타입 환경 오진을 다시 활성화하지 않는다.
- C: Emception 런타임과 외부 manifest에 의존한다.
- C#: `public/_framework`의 큰 바이너리 자산은 의도 없이 수정·삭제하지 않는다.
- COOP/COEP 헤더 변경은 C/C# WebAssembly 실행에 영향을 줄 수 있다.
- LangGraph: Pyodide에서 완전 지원한다고 가정하지 않는다. 실제 LLM/에이전트 실행은 별도 Python 백엔드가 필요하다.

## UI 및 접근성

- 기존 Tailwind CSS 4와 CSS Modules 스타일 체계를 사용하며 새 UI를 위해 MUI 같은 컴포넌트 프레임워크를 추가하지 않는다.
- 버튼에는 `type="button"`, 아이콘 전용 버튼에는 접근 가능한 이름을 제공한다.
- 좁은 화면에서 에디터 툴바와 모달이 넘치지 않는지 확인한다.
- 라이트/다크 테마 양쪽을 고려하고 Monaco/Sandpack 테마 동기화를 보존한다.

## 검증과 이력

- 코드나 데이터 변경 후 `pnpm lint`와 `pnpm build`를 실행한다.
- 커리큘럼 생성기를 수정했다면 `pnpm db:generate` 후 과정 수, 일차 연속성 및 빌드를 검증한다.
- 런타임 변경은 해당 언어의 정상 실행, 표준 입력, 오류, 타임아웃/초기화를 수동 점검한다.
- 사용자에게 영향을 주는 변경은 같은 작업에서 `HISTORY.md`의 최신 날짜 아래에 간결하게 추가한다. 기존 이력을 덮어쓰지 않는다.
- README의 기능·과정 수·실행 지원 범위가 구현과 달라지면 함께 갱신한다.
