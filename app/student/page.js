"use client";

import { useState } from "react";

const initialStudent = {
  name: "",
  email: "",
};

export default function StudentPage() {
  const [studentForm, setStudentForm] = useState(initialStudent);
  const [student, setStudent] = useState(null);
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setStudentForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAssignProblem(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoadingProblem(true);

    try {
      const response = await fetch("/api/students/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Problem assignment failed.");
      }

      setStudent(result.student);
      setProblem(result.problem);
      setAnswer("");
    } catch (assignError) {
      setError(assignError.message);
    } finally {
      setLoadingProblem(false);
    }
  }

  async function handleSubmitSolution(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student?.id,
          problemId: problem?.id,
          answer,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setSuccess("Your solution is in. Thanks for participating.");
      setAnswer("");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetFlow() {
    setStudent(null);
    setProblem(null);
    setAnswer("");
    setError("");
    setSuccess("");
    setStudentForm(initialStudent);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm text-cyan-200">Student Portal</p>
          <h1 className="mt-3 text-4xl font-semibold">Scan. Solve. Submit.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Enter your name and email to receive a random problem from the
            workshop set.
          </p>

          <form onSubmit={handleAssignProblem} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={studentForm.name}
                onChange={updateField}
                placeholder="Ada Lovelace"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={studentForm.email}
                onChange={updateField}
                placeholder="ada@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingProblem}
              className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingProblem ? "Assigning..." : "Get My Problem"}
            </button>
          </form>

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white p-8 text-slate-900">
          {!problem ? (
            <div className="flex h-full min-h-96 items-center justify-center rounded-3xl bg-slate-100 p-8 text-center text-slate-500">
              Your assigned problem will appear here after you submit your
              details.
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Assigned problem</p>
                  <h2 className="mt-2 text-3xl font-semibold">{problem.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
                >
                  Start over
                </button>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-100 p-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {problem.description || "No description was provided."}
                </p>
              </div>

              <form onSubmit={handleSubmitSolution} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Your solution
                  </label>
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Write your approach or final answer here..."
                    rows={8}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-400 focus:border-cyan-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Solution"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
