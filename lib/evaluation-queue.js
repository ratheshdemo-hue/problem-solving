import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { buildMockEvaluation, evaluateAnswer } from "@/lib/answer-evaluator";

const QUEUE_ROW_ID = 1;

async function ensureQueueRow(supabase) {
  await supabase
    .from("evaluation_queue_state")
    .upsert([{ id: QUEUE_ROW_ID, is_processing: false }], {
      onConflict: "id",
      ignoreDuplicates: true,
    });
}

async function acquireQueueLock(supabase) {
  await ensureQueueRow(supabase);

  const { data, error } = await supabase
    .from("evaluation_queue_state")
    .update({
      is_processing: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", QUEUE_ROW_ID)
    .eq("is_processing", false)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function releaseQueueLock(supabase) {
  await supabase
    .from("evaluation_queue_state")
    .update({
      is_processing: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", QUEUE_ROW_ID);
}

async function fetchNextPendingSubmission(supabase) {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
        id,
        answer,
        problems (
          title,
          description
        )
      `
    )
    .eq("evaluation_status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function markSubmissionEvaluated(supabase, submissionId, evaluation) {
  const { error } = await supabase
    .from("submissions")
    .update({
      score: evaluation.score,
      feedback: evaluation.feedback,
      evaluation_source: evaluation.source,
      evaluation_status: "completed",
      evaluated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    throw error;
  }
}

async function processSubmission(supabase, submission) {
  const problemTitle = submission.problems?.title || "Untitled Problem";
  const problemDescription = submission.problems?.description || "";
  const mockEvaluation = buildMockEvaluation(submission.answer, problemTitle);

  try {
    const evaluation = await evaluateAnswer({
      answer: submission.answer,
      problemTitle,
      problemDescription,
    });

    await markSubmissionEvaluated(supabase, submission.id, evaluation);
  } catch {
    await markSubmissionEvaluated(supabase, submission.id, mockEvaluation);
  }
}

export async function processEvaluationQueue() {
  const supabase = createSupabaseAdmin();
  const hasLock = await acquireQueueLock(supabase);

  if (!hasLock) {
    return { started: false };
  }

  let processedCount = 0;

  try {
    while (true) {
      const submission = await fetchNextPendingSubmission(supabase);

      if (!submission) {
        break;
      }

      await processSubmission(supabase, submission);
      processedCount += 1;
    }

    return { started: true, processedCount };
  } finally {
    await releaseQueueLock(supabase);
  }
}
