export type LanguageSlug =
  | "python"
  | "javascript"
  | "react"
  | "java"
  | "kotlin"
  | "python-langgraph"
  | "c"
  | "csharp";

export type StudyLanguage = {
  slug: LanguageSlug;
  name: string;
  shortName: string;
  description: string;
  courseLength: number;
  accent:
    | "sky"
    | "amber"
    | "cyan"
    | "orange"
    | "violet"
    | "emerald"
    | "rose"
    | "indigo";
};

export type Lesson = {
  id: string;
  language: LanguageSlug;
  day: number;
  stage: number;
  stageName: string;
  level: "beginner" | "elementary" | "intermediate" | "advanced" | "project";
  title: string;
  summary: string;
  detailedExplanation: string;
  keyPoints: string[];
  objectives: string[];
  practice: {
    prompt: string;
    starterCode: string;
    solutionCode: string;
  };
  estimatedMinutes: number;
  published: boolean;
};
