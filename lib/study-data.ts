import languagesJson from "@/db/languages.json";
import javaJson from "@/db/curricula/java.json";
import javascriptJson from "@/db/curricula/javascript.json";
import kotlinJson from "@/db/curricula/kotlin.json";
import pythonJson from "@/db/curricula/python.json";
import reactJson from "@/db/curricula/react.json";
import pythonLangGraphJson from "@/db/curricula/python-langgraph.json";

export type LanguageSlug = "python" | "javascript" | "react" | "java" | "kotlin" | "python-langgraph";

export type StudyLanguage = {
  slug: LanguageSlug;
  name: string;
  shortName: string;
  description: string;
  courseLength: number;
  accent: "sky" | "amber" | "cyan" | "orange" | "violet" | "emerald";
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

const curricula: Record<LanguageSlug, Lesson[]> = {
  python: pythonJson as Lesson[],
  javascript: javascriptJson as Lesson[],
  react: reactJson as Lesson[],
  java: javaJson as Lesson[],
  kotlin: kotlinJson as Lesson[],
  "python-langgraph": pythonLangGraphJson as Lesson[],
};

export const languages = languagesJson as StudyLanguage[];

export function getLanguage(slug: string) {
  return languages.find((language) => language.slug === slug);
}

export function getCurriculum(slug: LanguageSlug) {
  return curricula[slug];
}

export function getLesson(slug: LanguageSlug, day: number) {
  return curricula[slug].find((lesson) => lesson.day === day);
}

export function getAllLessons() {
  return languages.flatMap((language) => curricula[language.slug]);
}
