import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const supabase = createSupabaseAdmin();
    const { id } = await params;

    const { data, error } = await supabase
      .from("submissions")
      .select("id, score, feedback, evaluation_source, evaluation_status")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      score: data.score,
      feedback: data.feedback || "AI evaluation queued. Results will appear shortly.",
      source: data.evaluation_source || "pending",
      status: data.evaluation_status || "pending",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to load submission evaluation." },
      { status: 500 }
    );
  }
}
