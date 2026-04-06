import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const { name, email } = await request.json();
    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: student, error: studentError } = await supabase
      .from("students")
      .upsert([{ name: trimmedName, email: trimmedEmail }], {
        onConflict: "email",
      })
      .select("id, name, email")
      .single();

    if (studentError) {
      throw studentError;
    }

    const { data: problems, error: problemsError } = await supabase
      .from("problems")
      .select("id, title, description");

    if (problemsError) {
      throw problemsError;
    }

    if (!problems.length) {
      return NextResponse.json(
        { error: "No problems are available yet. Ask the admin to upload one." },
        { status: 404 }
      );
    }

    const randomProblem =
      problems[Math.floor(Math.random() * problems.length)];

    return NextResponse.json({
      student,
      problem: randomProblem,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to assign a problem." },
      { status: 500 }
    );
  }
}
