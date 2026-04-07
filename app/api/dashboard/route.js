import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { maskStudentName, previewAnswer } from "@/lib/submission-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();

    const [{ count, error: countError }, { data, error: listError }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("submissions")
          .select(
            `
              id,
              answer,
              score,
              feedback,
              evaluation_source,
              evaluation_status,
              created_at,
              students (
                name
              ),
              problems (
                title
              )
            `
          )
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

    if (countError) {
      throw countError;
    }

    if (listError) {
      throw listError;
    }

    const submissions = (data || []).map((item) => ({
      id: item.id,
      studentName: maskStudentName(item.students?.name),
      problemTitle: item.problems?.title || "Untitled Problem",
      answerPreview: previewAnswer(item.answer),
      score: item.score ?? null,
      feedback:
        item.feedback ||
        (item.evaluation_status === "pending"
          ? "AI evaluation queued."
          : "No feedback yet."),
      evaluationSource: item.evaluation_source || "mock",
      evaluationStatus: item.evaluation_status || "completed",
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      totalSubmissions: count || 0,
      submissions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
