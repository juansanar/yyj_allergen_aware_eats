import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const manuscriptPath = path.join(process.cwd(), "manuscript.md");
    if (!fs.existsSync(manuscriptPath)) {
      return NextResponse.json(
        { error: "Manuscript draft not found in workspace." },
        { status: 404 }
      );
    }
    const markdownContent = fs.readFileSync(manuscriptPath, "utf-8");
    return new NextResponse(markdownContent, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to read manuscript file", details: error.message },
      { status: 500 }
    );
  }
}
