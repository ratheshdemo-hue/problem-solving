"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalSubmissions: 0,
    submissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load dashboard data.");
      }

      setDashboardData(result);
      setError("");
    } catch (dashboardError) {
      setError(dashboardError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    let channel;

    try {
      const supabase = createSupabaseBrowser();
      channel = supabase
        .channel("dashboard-submissions")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "submissions",
          },
          () => fetchDashboard()
        )
        .subscribe();
    } catch (subscriptionError) {
      setError(subscriptionError.message);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [fetchDashboard]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-cyan-200">Live Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold">
              Real-time workshop submissions
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              New answers appear automatically as students submit from the QR
              flow.
            </p>
          </div>

          <div className="rounded-3xl bg-cyan-400 px-8 py-6 text-slate-950">
            <p className="text-sm font-medium uppercase tracking-[0.2em]">
              Total submissions
            </p>
            <p className="mt-2 text-5xl font-semibold">
              {dashboardData.totalSubmissions}
            </p>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white p-8 text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Submission feed</p>
              <h2 className="mt-2 text-3xl font-semibold">Latest answers</h2>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <Link
                href="/student"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
              >
                Open student page
              </Link>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[0.8fr_1.1fr_1.2fr_0.5fr_1.4fr] gap-4 bg-slate-100 px-5 py-4 text-sm font-medium text-slate-600">
              <span>Student</span>
              <span>Problem</span>
              <span>Answer preview</span>
              <span>Score</span>
              <span>Feedback</span>
            </div>

            {dashboardData.submissions.length ? (
              <div className="divide-y divide-slate-200">
                {dashboardData.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="grid grid-cols-[0.8fr_1.1fr_1.2fr_0.5fr_1.4fr] gap-4 px-5 py-4 text-sm text-slate-700"
                  >
                    <span className="font-medium">{submission.studentName}</span>
                    <span>{submission.problemTitle}</span>
                    <span>{submission.answerPreview}</span>
                    <span className="font-semibold">
                      {submission.evaluationStatus === "pending"
                        ? "..."
                        : submission.score
                          ? `${submission.score}/10`
                          : "-"}
                    </span>
                    <span>
                      {submission.feedback}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-500">
                        {submission.evaluationStatus === "pending"
                          ? "queued"
                          : submission.evaluationSource}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No submissions yet. They will appear here in real time.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
