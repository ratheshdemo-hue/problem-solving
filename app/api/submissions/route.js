import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { evaluateAnswer } from "@/lib/answer-evaluator";

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
    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select("title, description")
      .eq("id", problemId)
      .single();

    if (problemError) {
      throw problemError;
    }

    const evaluation = await evaluateAnswer({
      answer: trimmedAnswer,
      problemTitle: problem.title,
      problemDescription: problem.description,
    });

    const { error } = await supabase.from("submissions").insert([
      {
        student_id: studentId,
        problem_id: problemId,
        answer: trimmedAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        evaluation_source: evaluation.source,
      },
    ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Solution submitted successfully.",
      evaluation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to submit solution." },
      { status: 500 }
    );
  }
}
