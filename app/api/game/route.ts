import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const ALLOWED_CATEGORIES = ["makanan", "travel", "entertainment", "random"] as const;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const GAME_TYPES = ["thisOrThat", "wouldYouRather"] as const;

type VariablesData = Record<string, string[]>;
type WyrData = [string, string][];

function getVariables(): VariablesData {
  const path = join(process.cwd(), "data", "variables.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as VariablesData;
}

function getWyrPairs(): WyrData {
  const path = join(process.cwd(), "data", "wyr.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as WyrData;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export async function POST(request: NextRequest) {
  let category = "random";
  let count = 4;
  let gameType: (typeof GAME_TYPES)[number] = "thisOrThat";
  try {
    const body = await request.json().catch(() => ({}));
    const b = body as { category?: string; count?: number; gameType?: string };
    if (typeof b.category === "string" && ALLOWED_CATEGORIES.includes(b.category as (typeof ALLOWED_CATEGORIES)[number])) {
      category = b.category;
    }
    if (typeof b.count === "number" && b.count >= MIN_OPTIONS && b.count <= MAX_OPTIONS) {
      count = Math.floor(b.count);
    }
    if (typeof b.gameType === "string" && GAME_TYPES.includes(b.gameType as (typeof GAME_TYPES)[number])) {
      gameType = b.gameType as (typeof GAME_TYPES)[number];
    }
  } catch {
    // use defaults
  }

  try {
    if (gameType === "wouldYouRather") {
      const pairs = getWyrPairs();
      if (pairs.length === 0) {
        return NextResponse.json(
          { error: "No Would You Rather pairs available" },
          { status: 400 }
        );
      }
      const pair = pickRandom(pairs, 1)[0];
      const options = [pair[0], pair[1]];
      return NextResponse.json({ options });
    }

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
