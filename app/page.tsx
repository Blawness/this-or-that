"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "random", label: "Random" },
  { value: "makanan", label: "Makanan" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Entertainment" },
] as const;

type RoundChoice = { playerIndex: number; option: string };
type RoundResult = { round: number; choices: RoundChoice[] };

type GameState = "settings" | "playing" | "summary";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("settings");
  const [category, setCategory] = useState<string>("random");
  const [numOptions, setNumOptions] = useState<number>(4);
  const [numRounds, setNumRounds] = useState<number>(5);
  const [numPlayers, setNumPlayers] = useState<number>(2);

  const [currentRound, setCurrentRound] = useState(1);
  const [options, setOptions] = useState<string[] | null>(null);
  const [currentRoundChoices, setCurrentRoundChoices] = useState<RoundChoice[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoundOptions = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count: numOptions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setOptions(data.options ?? []);
    } catch {
      setError("Failed to load. Try again.");
    } finally {
      setLoading(false);
    }
  }, [category, numOptions]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setCurrentRound(1);
    setRoundResults([]);
    setCurrentRoundChoices([]);
    setOptions(null);
    setError(null);
    fetchRoundOptions();
  }, [fetchRoundOptions]);

  const handleOptionClick = useCallback(
    (option: string) => {
      if (!options || currentRoundChoices.length >= numPlayers) return;
      const playerIndex = currentRoundChoices.length + 1;
      const newChoices: RoundChoice[] = [...currentRoundChoices, { playerIndex, option }];
      setCurrentRoundChoices(newChoices);

      if (newChoices.length === numPlayers) {
        const result: RoundResult = { round: currentRound, choices: newChoices };
        setRoundResults((prev) => [...prev, result]);

        if (currentRound >= numRounds) {
          setGameState("summary");
          setOptions(null);
          setCurrentRoundChoices([]);
          return;
        }
        setCurrentRound((r) => r + 1);
        setCurrentRoundChoices([]);
        setOptions(null);
        fetchRoundOptions();
      }
    },
    [options, currentRoundChoices, numPlayers, currentRound, numRounds, fetchRoundOptions]
  );

  const playAgain = useCallback(() => {
    setGameState("settings");
    setRoundResults([]);
    setCurrentRound(1);
    setOptions(null);
    setCurrentRoundChoices([]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans">
      <main className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">This or That</h1>
          <p className="text-muted-foreground">
            Pilih opsi, urutan pencet = urutan player. Di akhir ada ringkasan.
          </p>
        </div>

        {gameState === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>Atur kategori, jumlah opsi, ronde, dan jumlah pemain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah opsi per ronde (2–6)</label>
                <Select value={String(numOptions)} onValueChange={(v) => setNumOptions(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah ronde (1–10)</label>
                <Select value={String(numRounds)} onValueChange={(v) => setNumRounds(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah pemain (2–6)</label>
                <Select value={String(numPlayers)} onValueChange={(v) => setNumPlayers(Number(v))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={startGame} size="lg" className="w-full">
                Mulai main
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === "playing" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Ronde {currentRound} / {numRounds}</CardTitle>
                <CardDescription>
                  Pencet urut: yang pertama = Player 1, kedua = Player 2, dst. ({currentRoundChoices.length}/{numPlayers} sudah pilih)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              {loading && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: numOptions }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              )}
              {!loading && options && options.length > 0 && (
                <div
                  className="grid gap-3 sm:grid-cols-2"
                  style={{
                    gridTemplateColumns:
                      options.length <= 2
                        ? "repeat(2, 1fr)"
                        : options.length <= 4
                          ? "repeat(2, 1fr)"
                          : "repeat(3, 1fr)",
                  }}
                >
                  {options.map((opt, idx) => {
                    const chosen = currentRoundChoices.find((c) => c.option === opt);
                    return (
                      <Button
                        key={idx}
                        variant={chosen ? "default" : "outline"}
                        size="lg"
                        className="min-h-16 text-base"
                        onClick={() => handleOptionClick(opt)}
                        disabled={currentRoundChoices.length >= numPlayers}
                      >
                        <span className="text-center">{opt}</span>
                        {chosen && (
                          <span className="ml-2 text-xs opacity-90">P{chosen.playerIndex}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {gameState === "summary" && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
              <CardDescription>Pilihan tiap pemain per ronde.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {roundResults.map((r) => (
                <div key={r.round} className="space-y-2">
                  <h3 className="font-semibold">Ronde {r.round}</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {r.choices.map((c) => (
                      <li key={`${r.round}-${c.playerIndex}`}>
                        Player {c.playerIndex}: {c.option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button onClick={playAgain} variant="outline" className="w-full">
                Main lagi
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
