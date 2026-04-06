import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
            ScanSolve
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Real-time workshop problem solving powered by QR, Excel, and
            Supabase.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Upload problems, let students scan into the session, and watch
            submissions appear instantly on a live dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/60 hover:bg-white/10"
          >
            <p className="text-sm text-cyan-200">Admin</p>
            <h2 className="mt-3 text-2xl font-semibold">Upload problems</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Import an Excel sheet and generate the workshop QR code.
            </p>
          </Link>

          <Link
            href="/student"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/60 hover:bg-white/10"
          >
            <p className="text-sm text-cyan-200">Student</p>
            <h2 className="mt-3 text-2xl font-semibold">Solve a problem</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Enter your details, receive a random problem, and submit a
              solution.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/60 hover:bg-white/10"
          >
            <p className="text-sm text-cyan-200">Dashboard</p>
            <h2 className="mt-3 text-2xl font-semibold">Watch live results</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              View the live submission count and masked participant feed.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
