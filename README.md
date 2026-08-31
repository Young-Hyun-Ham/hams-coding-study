# HAMS Coding Study

브라우저에서 개념을 읽고, 예제 코드를 수정하고, 가능한 언어는 즉시 실행하는 단계형 코딩 학습 서비스입니다. 현재 8개 과정에 각 160일 커리큘럼을 제공하며 학습 코드와 진도는 로컬 또는 로그인 사용자의 클라우드에 저장할 수 있습니다.

## 제공 과정

| 과정             |  기간 | 브라우저 실행 환경          |
| ---------------- | ----: | --------------------------- |
| Python           | 160일 | Pyodide Web Worker          |
| JavaScript       | 160일 | 전용 Web Worker             |
| React            | 160일 | Sandpack React/TypeScript   |
| C                | 160일 | Emception/Clang WebAssembly |
| C#               | 160일 | BrowserCSharp WebAssembly   |
| Java             | 160일 | 코드 작성 전용              |
| Kotlin           | 160일 | 코드 작성 전용              |
| Python LangGraph | 160일 | 코드 작성 전용              |

각 과정은 40일 기본 과정, 60일 심화 과정, 60일 프로젝트 과정으로 구성됩니다. 전체 커리큘럼은 `db/curricula/*.json`에 있으며 총 1,280개 학습 데이터를 포함합니다.

## 주요 기능

- 언어별 커리큘럼과 단계·일차별 학습 목록
- 학습 목표, 핵심 포인트, 접을 수 있는 상세 개념 설명
- Monaco Editor 기반 실습 코드 편집
- 일차별 시작 코드와 예시 풀이 불러오기
- Prettier 기반 코드 정리 및 원본/한 줄 코드 복사
- 표준 입력, 실행 결과와 오류 출력
- React Preview와 Console 모달
- Zustand 기반 코드 초안·입력값·최근 학습 로컬 저장
- TanStack Query 기반 인증 및 서버 상태 처리
- HAMS SSO 로그인·로그아웃·프로필 연동
- Firebase Admin/Firestore 기반 사용자별 코드와 최근 학습 저장
- 라이트/다크 테마와 반응형 학습 화면

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, CSS Modules
- Monaco Editor
- Pyodide, Web Workers, WebAssembly
- `@codesandbox/sandpack-react`
- `@gameguild/emception-browser`, `browser-csharp`
- Zustand, TanStack Query
- Firebase Admin SDK
- `@hams-fam/sso-client`
- pnpm 10

## 시작하기

### 요구 사항

- Node.js 20 이상 권장
- pnpm 10.27 이상
- 외부 런타임 CDN에 접근할 수 있는 브라우저 네트워크

```bash
pnpm install
pnpm dev
```

기본 주소는 `http://localhost:3000`입니다.

### 환경 변수

로그인과 클라우드 저장 기능을 사용하려면 프로젝트 루트의 `.env.local`에 다음 값을 설정합니다.

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000

HAMS_OAUTH_SERVER_URL=http://localhost:3001
HAMS_OAUTH_CLIENT_ID=hams-coding-study
HAMS_OAUTH_CLIENT_SECRET=replace-with-issued-client-secret
HAMS_SESSION_SECRET=replace-with-a-long-random-secret

# 선택 사항
HAMS_COOKIE_PREFIX=hams_coding_study
HAMS_SSO_SESSION_MAX_AGE_SEC=604800

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

로컬에서 실제 SSO 서버 없이 인증 흐름을 확인하려면 개발 환경에서만 mock 로그인을 사용할 수 있습니다.

```dotenv
NEXT_PUBLIC_DEV_MOCK_LOGIN=true
HAMS_SSO_DEV_MOCK_USER_ID=dev-user
HAMS_SSO_DEV_MOCK_USER_EMAIL=dev@localhost
HAMS_SSO_DEV_MOCK_USER_LOGIN_ID=dev
HAMS_SSO_DEV_MOCK_USER_NAME=개발자
```

`NEXT_PUBLIC_DEV_MOCK_LOGIN`은 production에서 자동으로 비활성화됩니다. OAuth Client Secret, 세션 Secret과 Firebase Private Key를 브라우저 코드나 저장소에 노출하지 마세요.

## 명령어

```bash
pnpm dev          # 개발 서버
pnpm lint         # ESLint 검사
pnpm build        # 프로덕션 빌드 및 정적 페이지 생성 검증
pnpm start        # 프로덕션 서버
pnpm db:generate  # 커리큘럼 JSON 전체 재생성
```

`pnpm db:generate`는 `db/curricula/*.json` 전체를 덮어씁니다. 커리큘럼을 영구 수정할 때는 JSON만 직접 고치지 말고 `scripts/generate-curriculum.mjs`, `curriculum-extension.mjs`, `curriculum-solutions.mjs`, `curriculum-explanations.mjs`의 생성 원본도 함께 수정해야 합니다.

## 디렉터리 구조

```text
app/
  api/                         SSO, 사용자 정보, 학습 저장 API
  studies/[language]/          언어별 커리큘럼
  studies/[language]/[day]/    학습 상세 화면
components/                    에디터, 런타임, 인증, 진도 UI
db/
  languages.json               과정 메타데이터
  curricula/*.json             과정별 160일 학습 데이터
lib/                           데이터 접근, 실행기, Firebase, 포매터
public/                        Worker 및 C# WebAssembly 런타임 자산
scripts/                       커리큘럼 생성 원본
stores/                        Zustand 로컬 상태
```

## 실행 구조

일반 학습 화면은 `LessonWorkspace`, React 과정은 `ReactLessonWorkspace`를 사용합니다.

- Python 코드는 Pyodide Worker에서 실행됩니다. 표준 입력은 줄 단위로 `input()`에 전달됩니다.
- JavaScript는 격리된 Worker에서 실행되며 5초 제한을 둡니다.
- C는 브라우저에서 Clang/WebAssembly로 컴파일 후 실행합니다.
- C#은 포함된 BrowserCSharp 런타임 자산을 로드합니다.
- React는 Monaco에서 편집하고 Sandpack에서 번들·미리보기·콘솔을 처리합니다.
- Java, Kotlin, LangGraph는 현재 편집과 저장만 제공합니다. LangGraph의 실제 에이전트·LLM 실행은 API 키 보호와 패키지 호환성을 위해 별도 Python 서버를 두는 구성이 적합합니다.

`next.config.ts`의 COOP/COEP 헤더는 WebAssembly 런타임에 필요하므로 변경 시 C/C# 실행을 함께 검증해야 합니다.

## 데이터와 저장

- 비로그인 초안과 표준 입력은 Zustand persist를 통해 브라우저 저장소에 유지됩니다.
- 로그인 사용자는 `/api/study-progress`를 통해 Firestore의 `hcsUserProgress` 컬렉션에 일차별 코드와 최근 학습을 저장·불러올 수 있습니다.
- 인증 정보는 HAMS SSO의 HttpOnly 쿠키로 처리하며 클라이언트 상태에 access token을 저장하지 않습니다.
- Firebase 환경 변수가 없으면 클라우드 저장 API는 `503 firebase_not_configured`를 반환합니다.

## 검증 기준

변경 후 최소한 다음 명령을 실행합니다.

```bash
pnpm lint
pnpm build
```

런타임이나 에디터를 변경했다면 해당 언어의 코드 실행, 표준 입력, 오류 출력, 초기화와 예시 풀이도 브라우저에서 확인합니다. React 변경은 Preview와 Console까지 확인합니다.

## 프로젝트 문서

- [AGENTS.md](./AGENTS.md): 자동화 에이전트와 기여자를 위한 저장소 작업 규칙
- [CLAUDE.md](./CLAUDE.md): Claude가 이 저장소에서 따라야 할 진입 지침
- [HISTORY.md](./HISTORY.md): 날짜별 변경 이력
