import { after, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { processEvaluationQueue } from "@/lib/evaluation-queue";

export async function POST(request) {
  try {
    const { studentId, problemId, answer } = await request.json();
    const trimmedAnswer = String(answer || "").trim();

    if (!studentId || !problemId || !trimmedAnswer) {
      return NextResponse.json(
        { error: "Student, problem, and answer are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("submissions").insert([
      {
        student_id: studentId,
        problem_id: problemId,
        answer: trimmedAnswer,
        evaluation_source: "pending",
        evaluation_status: "pending",
      },
    ]);

    if (error) {
      throw error;
    }

    after(async () => {
      try {
        await processEvaluationQueue();
      } catch {
        // If the queue processor crashes, later submissions will trigger it again.
      }
    });

    return NextResponse.json({
      message: "Solution submitted successfully.",
      evaluation: {
        source: "pending",
        feedback: "AI evaluation queued. Results will appear shortly.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to submit solution." },
      { status: 500 }
    );
  }
}
