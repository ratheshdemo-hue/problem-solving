"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const studentLink = useMemo(() => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_APP_URL || "";
    }

    const baseUrl = window.location.origin || process.env.NEXT_PUBLIC_APP_URL;
    return `${baseUrl}/student`;
  }, []);

  useEffect(() => {
    if (!studentLink) {
      return;
    }

    QRCode.toDataURL(studentLink, {
      margin: 1,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(setQrCodeUrl)
      .catch(() => setError("Could not generate the QR code."));
  }, [studentLink]);

  async function handleUpload(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Choose an Excel file before uploading.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/problems/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed.");
      }

      setMessage(`${result.count} problems are ready for the workshop.`);
      setFile(null);
      event.target.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm text-cyan-200">Admin Workspace</p>
          <h1 className="mt-3 text-4xl font-semibold">Prepare ScanSolve</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Upload the Excel sheet used for the workshop. The app reads the
            first sheet and expects columns like <strong>title</strong> and
            <strong>description</strong>, but it will also use the first two
            columns if needed.
          </p>

          <form onSubmit={handleUpload} className="mt-8 space-y-4">
            <label className="block rounded-2xl border border-dashed border-cyan-300/40 bg-slate-900/70 p-5">
              <span className="mb-3 block text-sm font-medium text-slate-200">
                Excel file
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-medium file:text-slate-950"
              />
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Problems"}
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white p-8 text-slate-900">
          <p className="text-sm text-slate-500">Workshop QR</p>
          <h2 className="mt-3 text-3xl font-semibold">Student Entry</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Display this QR code so students can jump directly to the submission
            page.
          </p>

          <div className="mt-8 flex justify-center rounded-3xl bg-slate-100 p-6">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt="QR code for the student page"
                className="h-72 w-72 rounded-2xl"
                width={288}
                height={288}
              />
            ) : (
              <div className="flex h-72 w-72 items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-500">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
            <p className="font-medium">Student link</p>
            <p className="mt-2 break-all">{studentLink}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/student"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
            >
              Open student page
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
            >
              Open dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
