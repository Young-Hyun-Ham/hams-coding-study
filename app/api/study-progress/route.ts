import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getSsoUserFromRequest } from "@hams-fam/sso-client/core";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { getLanguage, getLesson } from "@/lib/study-data";

const usersCollection = "hcsUserProgress";

function error(message: string, status: number) {
  return Response.json({ ok: false, error: message }, { status });
}

function getContext(request: Request) {
  const user = getSsoUserFromRequest(request);
  if (!user) return { response: error("authentication_required", 401) };
  const db = getFirebaseAdminDb();
  if (!db) return { response: error("firebase_not_configured", 503) };
  return { user, db };
}

function resolveLesson(languageValue: unknown, dayValue: unknown) {
  if (typeof languageValue !== "string" || typeof dayValue !== "number")
    return null;
  const language = getLanguage(languageValue);
  const lesson =
    language && Number.isInteger(dayValue)
      ? getLesson(language.slug, dayValue)
      : undefined;
  return language && lesson ? { language, lesson } : null;
}

function serializeDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export async function GET(request: Request) {
  const context = getContext(request);
  if ("response" in context) return context.response;

  const lessonId = new URL(request.url).searchParams.get("lessonId");
  try {
    if (lessonId) {
      const snapshot = await context.db
        .collection(usersCollection)
        .doc(context.user.id)
        .collection("lessons")
        .doc(lessonId)
        .get();
      if (!snapshot.exists) return error("saved_lesson_not_found", 404);
      const data = snapshot.data()!;
      return Response.json({
        lesson: {
          lessonId,
          language: data.language,
          day: data.day,
          code: data.code,
          stdin: data.stdin ?? "",
          updatedAt: serializeDate(data.updatedAt),
        },
      });
    }

    const snapshot = await context.db
      .collection(usersCollection)
      .doc(context.user.id)
      .get();
    if (!snapshot.exists || !snapshot.data()?.lastLesson)
      return Response.json({ lastLesson: null });
    const lastLesson = snapshot.data()!.lastLesson;
    return Response.json({
      lastLesson: {
        ...lastLesson,
        updatedAt: serializeDate(lastLesson.updatedAt),
      },
    });
  } catch (cause) {
    console.error("Failed to read study progress.", cause);
    return error("study_progress_read_failed", 500);
  }
}

export async function POST(request: Request) {
  const context = getContext(request);
  if ("response" in context) return context.response;

  const body = await request.json().catch(() => null);
  const resolved = resolveLesson(body?.language, body?.day);
  if (!resolved) return error("invalid_lesson", 400);

  try {
    await context.db
      .collection(usersCollection)
      .doc(context.user.id)
      .set(
        {
          userId: context.user.id,
          lastLesson: {
            lessonId: resolved.lesson.id,
            language: resolved.language.slug,
            languageName: resolved.language.name,
            day: resolved.lesson.day,
            title: resolved.lesson.title,
            updatedAt: FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    return Response.json({ ok: true });
  } catch (cause) {
    console.error("Failed to record study progress.", cause);
    return error("study_progress_write_failed", 500);
  }
}

export async function PUT(request: Request) {
  const context = getContext(request);
  if ("response" in context) return context.response;

  const body = await request.json().catch(() => null);
  const resolved = resolveLesson(body?.language, body?.day);
  if (!resolved || body?.lessonId !== resolved.lesson.id)
    return error("invalid_lesson", 400);
  if (typeof body.code !== "string" || body.code.length > 200_000)
    return error("invalid_code", 400);
  if (typeof body.stdin !== "string" || body.stdin.length > 50_000)
    return error("invalid_stdin", 400);

  try {
    const userRef = context.db.collection(usersCollection).doc(context.user.id);
    const batch = context.db.batch();
    batch.set(userRef.collection("lessons").doc(resolved.lesson.id), {
      lessonId: resolved.lesson.id,
      language: resolved.language.slug,
      day: resolved.lesson.day,
      code: body.code,
      stdin: body.stdin,
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.set(
      userRef,
      {
        userId: context.user.id,
        lastLesson: {
          lessonId: resolved.lesson.id,
          language: resolved.language.slug,
          languageName: resolved.language.name,
          day: resolved.lesson.day,
          title: resolved.lesson.title,
          updatedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await batch.commit();
    return Response.json({ ok: true });
  } catch (cause) {
    console.error("Failed to save lesson content.", cause);
    return error("lesson_save_failed", 500);
  }
}
