import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const resultsPath = path.join(process.cwd(), "data", "study_results.json");
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json(
        { error: "Study results have not been generated yet. Please run seeding." },
        { status: 404 }
      );
    }
    const data = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch study results", details: error.message },
      { status: 500 }
    );
  }
}
