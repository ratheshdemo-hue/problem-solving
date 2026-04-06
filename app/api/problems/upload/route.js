import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

function normalizeRow(row) {
  const keys = Object.keys(row);
  const title =
    row.title ||
    row.Title ||
    row.problem ||
    row.Problem ||
    row.problem_title ||
    row["Problem Title"] ||
    row[keys[0]];

  const description =
    row.description ||
    row.Description ||
    row.statement ||
    row.Statement ||
    row.problem_description ||
    row["Problem Description"] ||
    row[keys[1]] ||
    "";

  return {
    title: String(title || "").trim(),
    description: String(description || "").trim(),
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Please upload an Excel file." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
    const problems = rows.map(normalizeRow).filter((row) => row.title);

    if (!problems.length) {
      return NextResponse.json(
        { error: "No valid problem rows were found in the first sheet." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("problems")
      .upsert(problems, { onConflict: "title" });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Problems uploaded successfully.",
      count: problems.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to upload problems." },
      { status: 500 }
    );
  }
}
