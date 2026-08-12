import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { langGraphExplanations, solutionCatalog } from "./curriculum-solutions.mjs";
import { makeDetailedExplanation } from "./curriculum-explanations.mjs";
import { makeAdvancedTopics, makeProjectTopics } from "./curriculum-extension.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const curricula = {
  python: [
    "개발 환경과 첫 출력", "변수와 기본 자료형", "문자열 다루기", "숫자와 연산자", "입력과 형 변환",
    "조건문 기초", "다중 조건과 논리 연산", "for 반복문", "while 반복문", "기초 종합 문제",
    "리스트 생성과 접근", "리스트 메서드", "튜플과 불변 데이터", "딕셔너리 기초", "집합과 중복 제거",
    "중첩 컬렉션", "컴프리헨션", "문자열 알고리즘", "컬렉션 종합 문제", "미니 프로젝트: 성적 분석",
    "함수 선언과 호출", "매개변수와 반환값", "기본값과 키워드 인자", "가변 인자", "스코프와 클로저",
    "람다와 고차 함수", "재귀 함수", "모듈과 패키지", "타입 힌트", "함수 설계 문제",
    "예외 처리", "파일 읽기와 쓰기", "JSON 데이터 처리", "날짜와 시간", "정규 표현식",
    "이터레이터와 제너레이터", "데코레이터", "컨텍스트 매니저", "표준 라이브러리 활용", "미니 프로젝트: 로그 분석기",
    "클래스와 인스턴스", "생성자와 속성", "상속과 오버라이딩", "캡슐화와 프로퍼티", "데이터 클래스",
    "추상 클래스와 프로토콜", "객체지향 설계", "단위 테스트", "디버깅과 로깅", "리팩터링 실습",
    "시간 복잡도", "스택과 큐", "해시 테이블", "정렬 알고리즘", "이진 탐색",
    "그래프 탐색", "동적 계획법 입문", "비동기 프로그래밍", "API 데이터 처리", "최종 프로젝트: 문제 해결 도구"
  ],
  javascript: [
    "실행 환경과 첫 출력", "변수 선언 방식", "원시 타입", "연산자와 형 변환", "문자열과 템플릿 리터럴",
    "조건문", "반복문", "함수 선언", "화살표 함수", "기초 종합 문제",
    "배열 기초", "배열 변경 메서드", "map·filter·reduce", "객체 기초", "객체 구조 분해",
    "Map과 Set", "스프레드와 나머지 문법", "옵셔널 체이닝", "컬렉션 문제", "미니 프로젝트: 장바구니",
    "스코프와 호이스팅", "클로저", "this 바인딩", "콜백 함수", "고차 함수",
    "프로토타입", "클래스 문법", "모듈 시스템", "에러 처리", "함수형 설계 문제",
    "DOM 선택과 변경", "이벤트 처리", "폼 데이터", "브라우저 저장소", "Fetch API",
    "Promise 기초", "async와 await", "병렬 비동기 처리", "AbortController", "미니 프로젝트: 검색 앱",
    "이벤트 루프", "마이크로태스크", "이터레이터", "제너레이터", "Proxy와 Reflect",
    "정규 표현식", "날짜와 국제화", "웹 컴포넌트 기초", "단위 테스트", "디버깅과 성능 측정",
    "자료구조 구현", "재귀와 백트래킹", "정렬과 탐색", "메모이제이션", "디자인 패턴",
    "TypeScript 입문", "Node.js 기초", "REST API 연동", "보안과 입력 검증", "최종 프로젝트: 웹 애플리케이션"
  ],
  react: [
    "React와 컴포넌트", "JSX 문법", "Props 전달", "이벤트 처리", "조건부 렌더링",
    "리스트와 key", "컴포넌트 합성", "스타일 적용", "개발자 도구", "기초 UI 실습",
    "useState 기초", "상태 업데이트", "폼 상태 관리", "상태 끌어올리기", "파생 상태",
    "useEffect 기초", "Effect 정리", "데이터 가져오기", "로딩과 오류 UI", "미니 프로젝트: 할 일 목록",
    "useRef", "Context API", "useReducer", "커스텀 Hook", "Hook 설계 규칙",
    "컴포넌트 생명주기", "제어·비제어 컴포넌트", "Portal", "Error Boundary", "상태 설계 문제",
    "React Router 개념", "중첩 레이아웃", "URL 상태", "인증 화면 구성", "접근성 기초",
    "TanStack Query 기초", "서버 상태 캐싱", "Mutation 처리", "낙관적 업데이트", "미니 프로젝트: 게시판",
    "Zustand 기초", "전역 상태 분리", "상태 영속화", "선택자 최적화", "복합 폼 설계",
    "React Testing Library", "컴포넌트 테스트", "Hook 테스트", "Mock Service Worker", "테스트 전략",
    "React.memo", "useMemo와 useCallback", "코드 분할", "Suspense", "렌더링 성능 분석",
    "Next.js App Router", "서버와 클라이언트 컴포넌트", "Server Actions 개념", "배포와 모니터링", "최종 프로젝트: 스터디 플랫폼"
  ],
  java: [
    "JDK와 첫 프로그램", "변수와 자료형", "연산자", "입력과 출력", "형 변환",
    "조건문", "for 반복문", "while 반복문", "배열", "기초 종합 문제",
    "메서드 선언", "매개변수와 반환값", "메서드 오버로딩", "가변 인자", "재귀 호출",
    "문자열", "StringBuilder", "다차원 배열", "열거형", "미니 프로젝트: 성적 관리",
    "클래스와 객체", "생성자", "접근 제어자", "캡슐화", "static과 final",
    "상속", "메서드 오버라이딩", "다형성", "추상 클래스", "인터페이스",
    "중첩 클래스", "레코드", "제네릭 기초", "제네릭 메서드", "객체지향 설계 문제",
    "예외 처리", "컬렉션 프레임워크", "List와 Set", "Map", "Comparable과 Comparator",
    "람다 표현식", "함수형 인터페이스", "Stream API", "Optional", "미니 프로젝트: 주문 분석",
    "파일 입출력", "NIO", "직렬화와 JSON", "날짜와 시간 API", "정규 표현식",
    "JUnit 테스트", "동시성 기초", "ExecutorService", "CompletableFuture", "JVM 메모리 구조",
    "자료구조와 복잡도", "정렬과 탐색", "디자인 패턴", "REST API 개념", "최종 프로젝트: 콘솔 서비스"
  ],
  kotlin: [
    "환경 설정과 첫 출력", "val과 var", "기본 타입", "문자열 템플릿", "Null 안전성",
    "조건식", "범위와 반복", "when 표현식", "함수 기초", "기초 종합 문제",
    "List와 MutableList", "Set과 Map", "컬렉션 변환", "filter와 map", "구조 분해",
    "기본 인자와 이름 인자", "확장 함수", "중위 함수", "고차 함수", "미니 프로젝트: 지출 분석",
    "클래스와 객체", "주 생성자", "데이터 클래스", "상속", "인터페이스",
    "object와 companion object", "sealed 클래스", "enum 클래스", "제네릭", "객체지향 설계 문제",
    "스코프 함수 let", "run과 with", "apply와 also", "위임 프로퍼티", "지연 초기화",
    "예외 처리", "Result 타입", "파일 처리", "JSON 모델링", "미니 프로젝트: 설정 관리자",
    "코루틴 기초", "suspend 함수", "CoroutineScope", "Dispatcher", "구조화된 동시성",
    "Flow 기초", "Flow 연산자", "상태 흐름", "채널", "비동기 테스트",
    "JUnit과 Kotest", "함수형 설계", "DSL 만들기", "Java 상호 운용", "성능과 메모리",
    "Android 구성 요소", "Compose 기초", "상태 관리", "네트워크와 저장소", "최종 프로젝트: 학습 앱"
  ],
  "python-langgraph": [
    "LangGraph 개요와 설치", "그래프 기반 워크플로 사고법", "TypedDict 상태 정의", "노드 함수 작성", "START와 END 엣지",
    "그래프 컴파일과 invoke", "상태 업데이트 규칙", "여러 노드 연결", "Mermaid 그래프 시각화", "미니 프로젝트: 선형 처리 파이프라인",
    "Annotated 리듀서", "MessagesState 활용", "입력·출력 상태 스키마", "런타임 컨텍스트", "Pydantic 상태 모델",
    "비공개 내부 상태", "Overwrite로 값 교체", "비동기 노드", "RetryPolicy와 CachePolicy", "미니 프로젝트: 요청 분류 그래프",
    "조건부 엣지", "Literal 기반 라우팅", "Command로 업데이트와 이동", "Send를 이용한 Map-Reduce", "순환 그래프와 에이전트 루프",
    "재귀 제한과 무한 루프 방지", "병렬 브랜치 실행", "병렬 업데이트 리듀서", "동적 작업 대기", "미니 프로젝트: 병렬 문서 분석",
    "values 스트리밍", "updates 스트리밍", "messages 스트리밍", "custom 스트리밍", "비동기 astream",
    "debug 스트림과 실행 추적", "상태 히스토리 조회", "현재 상태 검사", "update_state로 상태 수정", "미니 프로젝트: 실시간 진행 UI",
    "InMemorySaver 체크포인트", "thread_id와 대화 분리", "지속 실행과 장애 복구", "Time Travel과 재실행", "PostgresSaver 운영 저장소",
    "Store 기반 장기 메모리", "메모리 네임스페이스", "의미 기반 메모리 검색", "메모리 관리 정책", "미니 프로젝트: 개인화 어시스턴트",
    "interrupt로 실행 중단", "Command resume으로 재개", "승인·거절 Human-in-the-loop", "사용자 수정 후 상태 반영", "서브그래프 구성",
    "서브그래프 지속성 전략", "ToolNode와 tools_condition", "멀티 에이전트 오케스트레이션", "테스트와 LangSmith 추적", "최종 프로젝트: 운영형 에이전트 시스템"
  ],
  c: [
    "개발 환경과 첫 출력", "변수와 기본 자료형", "상수와 형 변환", "연산자", "표준 입력과 출력", "조건문", "switch 문", "for 반복문", "while 반복문", "기초 종합 문제",
    "함수 선언과 호출", "매개변수와 반환값", "변수의 범위", "배열 기초", "문자 배열과 문자열", "다차원 배열", "포인터 기초", "배열과 포인터", "문자열 함수", "미니 프로젝트: 성적 계산기",
    "구조체", "열거형", "typedef", "동적 메모리 할당", "포인터 연산", "함수 포인터", "재귀 함수", "헤더와 소스 분리", "전처리기", "메모리 안전성",
    "파일 읽기와 쓰기", "명령행 인자", "오류 코드와 errno", "비트 연산", "연결 리스트", "스택과 큐", "정렬과 탐색", "디버깅", "단위 테스트 기초", "미니 프로젝트: 연락처 관리"
  ],
  csharp: [
    ".NET과 첫 출력", "변수와 기본 형식", "문자열과 보간", "연산자", "콘솔 입력과 출력", "조건문", "switch 식", "for 반복문", "while 반복문", "기초 종합 문제",
    "메서드 선언과 호출", "매개변수와 반환값", "배열", "List 컬렉션", "Dictionary", "LINQ 기초", "예외 처리", "nullable 형식", "튜플", "미니 프로젝트: 성적 계산기",
    "클래스와 객체", "생성자", "프로퍼티", "캡슐화", "상속", "다형성", "인터페이스", "record", "enum", "객체지향 설계 실습",
    "제네릭", "델리게이트", "람다식", "이벤트", "파일 입출력", "JSON 직렬화", "비동기 Task", "async와 await", "단위 테스트 기초", "미니 프로젝트: 일정 관리자"
  ]
};

const languageNames = { python: "Python", javascript: "JavaScript", react: "React", java: "Java", kotlin: "Kotlin", "python-langgraph": "Python LangGraph", c: "C", csharp: "C#" };
const stageNames = ["입문", "기초", "활용", "중급", "심화", "프로젝트"];
const levels = ["beginner", "beginner", "elementary", "intermediate", "advanced", "project"];

function makePractice(language, day, stage, title) {
  const safeTitle = JSON.stringify(title);
  const prompt = `${title}에서 배운 개념을 사용해 Day ${day} 예제를 완성하고, 입력값을 바꿔 결과를 확인하세요.`;

  if (language === "python") {
    const starterCode = stage <= 2
      ? `# Day ${day}: ${title}\nvalue = int(input() or 0)\n\n# TODO: 학습한 개념으로 result를 완성하세요.\nresult = None\nprint(result)`
      : stage <= 4
        ? `# Day ${day}: ${title}\ndef solve_day_${day}(values):\n    # TODO: ${title} 개념을 적용하세요.\n    pass\n\nprint(solve_day_${day}([1, 2, 3, 4]))`
        : `# Day ${day}: ${title}\nclass Day${day}Practice:\n    def solve(self, values):\n        # TODO: 심화 로직을 구현하세요.\n        pass\n\nprint(Day${day}Practice().solve([1, 2, 3, 4]))`;
    const solutionCode = stage <= 2
      ? `# Day ${day}: ${title} 예시 풀이\nvalue = int(input() or 0)\nresult = {"day": ${day}, "topic": ${safeTitle}, "value": value, "is_even": value % 2 == 0}\nprint(result)`
      : stage <= 4
        ? `# Day ${day}: ${title} 예시 풀이\ndef solve_day_${day}(values):\n    filtered = [value for value in values if value % 2 == ${day % 2}]\n    return {"topic": ${safeTitle}, "values": filtered, "total": sum(filtered)}\n\nprint(solve_day_${day}([1, 2, 3, 4]))`
        : `# Day ${day}: ${title} 예시 풀이\nclass Day${day}Practice:\n    def solve(self, values):\n        ordered = sorted(set(values), reverse=${day % 2 === 0 ? "True" : "False"})\n        return {"topic": ${safeTitle}, "result": ordered}\n\nprint(Day${day}Practice().solve([4, 1, 2, 4, 3]))`;
    return { prompt, starterCode, solutionCode };
  }

  if (language === "python-langgraph") {
    return {
      prompt,
      starterCode: `# Day ${day}: ${title}\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    value: str\n\ndef study_node(state: State):\n    # TODO: ${title} 개념을 적용하세요.\n    return {"value": state["value"]}\n\nbuilder = StateGraph(State)\nbuilder.add_node("study", study_node)\nbuilder.add_edge(START, "study")\nbuilder.add_edge("study", END)\ngraph = builder.compile()\nprint(graph.invoke({"value": "start"}))`,
      solutionCode: `# Day ${day}: ${title} 예시 풀이\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    value: str\n    history: list[str]\n\ndef study_node(state: State):\n    return {"value": f"${title} 완료", "history": [*state.get("history", []), ${safeTitle}]}\n\nbuilder = StateGraph(State)\nbuilder.add_node("study", study_node)\nbuilder.add_edge(START, "study")\nbuilder.add_edge("study", END)\ngraph = builder.compile()\nprint(graph.invoke({"value": "start", "history": []}))`,
    };
  }

  if (language === "javascript") {
    return {
      prompt,
      starterCode: `// Day ${day}: ${title}\nfunction solveDay${day}(values) {\n  // TODO: ${title} 개념을 적용하세요.\n}\n\nconsole.log(solveDay${day}([1, 2, 3, 4]));`,
      solutionCode: `// Day ${day}: ${title} 예시 풀이\nfunction solveDay${day}(values) {\n  const selected = values.filter((value) => value % 2 === ${day % 2});\n  return { day: ${day}, topic: ${safeTitle}, total: selected.reduce((sum, value) => sum + value, 0) };\n}\n\nconsole.log(solveDay${day}([1, 2, 3, 4]));`
    };
  }

  if (language === "c") {
    return {
      prompt,
      starterCode: `// Day ${day}: ${title}\n#include <stdio.h>\n\nint main(void) {\n    // TODO: ${title} 개념을 적용하세요.\n    return 0;\n}`,
      solutionCode: `// Day ${day}: ${title} 예시 풀이\n#include <stdio.h>\n\nint main(void) {\n    int values[] = {1, 2, 3, 4};\n    int total = 0;\n    for (int i = 0; i < 4; i++) {\n        total += values[i];\n    }\n    printf("${title}: %d\\n", total);\n    return 0;\n}`,
    };
  }

  if (language === "csharp") {
    return {
      prompt,
      starterCode: `// Day ${day}: ${title}\nvar values = new[] { 1, 2, 3, 4 };\n\n// TODO: ${title} 개념을 적용하세요.\nConsole.WriteLine(values.Length);`,
      solutionCode: `// Day ${day}: ${title} 예시 풀이\nvar values = new[] { 1, 2, 3, 4 };\nvar total = values.Sum();\nConsole.WriteLine("${title}: " + total);`,
    };
  }

  if (language === "react") {
    return {
      prompt,
      starterCode: `// Day ${day}: ${title}\ntype Day${day}Props = { items?: string[] };\n\nexport default function Day${day}Practice({ items = [] }: Day${day}Props) {\n  // TODO: ${title} 개념을 적용해 UI를 완성하세요.\n  return (\n    <main style={{ padding: 24, fontFamily: "sans-serif" }}>\n      <h1>${title}</h1>\n      <p>등록된 항목: {items.length}개</p>\n    </main>\n  );\n}`,
      solutionCode: `// Day ${day}: ${title} 예시 풀이\nimport { useState } from "react";\n\ntype Day${day}Props = { items: string[] };\n\nexport default function Day${day}Practice({ items }: Day${day}Props) {\n  const [selected, setSelected] = useState<string | null>(null);\n  return <section><h2>{${safeTitle}}</h2>{items.map((item) => <button key={item} onClick={() => setSelected(item)}>{item}</button>)}<p>{selected ?? "선택 없음"}</p></section>;\n}`
    };
  }

  if (language === "java") {
    return {
      prompt,
      starterCode: `// Day ${day}: ${title}\nimport java.util.List;\n\npublic class Main {\n    static int solveDay${day}(List<Integer> values) {\n        // TODO: ${title} 개념을 적용하세요.\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(solveDay${day}(List.of(1, 2, 3, 4)));\n    }\n}`,
      solutionCode: `// Day ${day}: ${title} 예시 풀이\nimport java.util.List;\n\npublic class Main {\n    static int solveDay${day}(List<Integer> values) {\n        return values.stream().filter(value -> value % 2 == ${day % 2}).mapToInt(Integer::intValue).sum();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(${safeTitle});\n        System.out.println(solveDay${day}(List.of(1, 2, 3, 4)));\n    }\n}`
    };
  }

  return {
    prompt,
    starterCode: `// Day ${day}: ${title}\nfun solveDay${day}(values: List<Int>): Int {\n    // TODO: ${title} 개념을 적용하세요.\n    return 0\n}\n\nfun main() = println(solveDay${day}(listOf(1, 2, 3, 4)))`,
    solutionCode: `// Day ${day}: ${title} 예시 풀이\nfun solveDay${day}(values: List<Int>): Int = values.filter { it % 2 == ${day % 2} }.sum()\n\nfun main() {\n    println(${safeTitle})\n    println(solveDay${day}(listOf(1, 2, 3, 4)))\n}`
  };
}

function makeExpansionExplanation(language, title, stage) {
  const kind = stage === 5 ? "심화 주제" : "실전 프로젝트";
  const focus = stage === 5
    ? "내부 동작을 이해한 뒤 경계 조건, 테스트, 성능까지 단계적으로 검증"
    : "요구사항을 작은 기능으로 나누고 구현, 오류 처리, 테스트, 개선 순서로 완성";
  return `${title}은(는) ${languageNames[language]} ${kind}입니다. 단순히 문법을 따라 쓰는 데서 끝내지 않고 ${focus}하는 것이 핵심입니다. 제공된 시작 코드를 실행한 뒤 입력 데이터와 실패 조건을 추가하고, 예시 풀이와 비교하며 자신만의 구현으로 확장해 보세요.`;
}

await mkdir(path.join(root, "db", "curricula"), { recursive: true });

for (const [language, topics] of Object.entries(curricula)) {
  const expandedTopics = [
    ...topics.slice(0, 40),
    ...makeAdvancedTopics(language),
    ...makeProjectTopics(language),
  ];
  if (expandedTopics.length !== 160) throw new Error(`${language} 과정은 정확히 160개여야 합니다.`);

  const lessons = expandedTopics.map((title, index) => {
    const day = index + 1;
    const stage = day <= 40 ? Math.ceil(day / 10) : day <= 100 ? 5 : 6;
    const generatedPractice = makePractice(language, day, stage, title);
    const practice = {
      ...generatedPractice,
      solutionCode: index < 40 && solutionCatalog[language]
        ? solutionCatalog[language][index]
        : generatedPractice.solutionCode,
    };
    return {
      id: `${language}-day-${String(day).padStart(2, "0")}`,
      language,
      day,
      stage,
      stageName: stageNames[stage - 1],
      level: levels[stage - 1],
      title,
      summary: `${languageNames[language]}의 ${title} 개념을 이해하고 단계별 예제로 익힙니다.`,
      detailedExplanation: index >= 40 || language === "c" || language === "csharp"
        ? makeExpansionExplanation(language, title, stage)
        : language === "python-langgraph"
          ? langGraphExplanations[index]
          : makeDetailedExplanation(language, index, title, stage, practice.solutionCode),
      keyPoints: [
        `${title}의 핵심 문법과 실행 흐름`,
        `입력값과 경계 조건에 따른 결과 차이`,
        `읽기 쉬운 코드로 분리하고 검증하는 방법`
      ],
      objectives: [`${title}의 핵심 개념 설명하기`, `${title}을 활용한 코드 작성하기`],
      practice,
      estimatedMinutes: stage < 3 ? 30 : stage < 5 ? 45 : 60,
      published: true
    };
  });

  await writeFile(
    path.join(root, "db", "curricula", `${language}.json`),
    `${JSON.stringify(lessons, null, 2)}\n`,
    "utf8"
  );
}

console.log(`${Object.keys(curricula).length}개 과정, 총 ${Object.keys(curricula).length * 160}개 학습 데이터를 생성했습니다.`);
