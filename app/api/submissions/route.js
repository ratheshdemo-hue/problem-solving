import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

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
      },
    ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Solution submitted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to submit solution." },
      { status: 500 }
    );
  }
}
