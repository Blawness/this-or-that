import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const ALLOWED_CATEGORIES = ["makanan", "travel", "entertainment", "random"] as const;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

type VariablesData = Record<string, string[]>;

function getVariables(): VariablesData {
  const path = join(process.cwd(), "data", "variables.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as VariablesData;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export async function POST(request: NextRequest) {
  let category = "random";
  let count = 4;
  try {
    const body = await request.json().catch(() => ({}));
    const b = body as { category?: string; count?: number };
    if (typeof b.category === "string" && ALLOWED_CATEGORIES.includes(b.category as (typeof ALLOWED_CATEGORIES)[number])) {
      category = b.category;
    }
    if (typeof b.count === "number" && b.count >= MIN_OPTIONS && b.count <= MAX_OPTIONS) {
      count = Math.floor(b.count);
    }
  } catch {
    // use defaults
  }

  try {
    const data = getVariables();
    let pool: string[] = [];
    if (category === "random") {
      const all = (ALLOWED_CATEGORIES as readonly string[])
        .filter((k) => k !== "random")
        .flatMap((k) => data[k] ?? []);
      pool = all;
    } else {
      pool = data[category] ?? [];
    }

    if (pool.length < count) {
      return NextResponse.json(
        { error: "Not enough items in category" },
        { status: 400 }
      );
    }

    const options = pickRandom(pool, count);
    return NextResponse.json({ options });
  } catch (err) {
    console.error("Game API error:", err);
    return NextResponse.json(
      { error: "Failed to load options. Try again." },
      { status: 500 }
    );
  }
}
