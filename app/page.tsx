"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
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
import { cn } from "@/lib/utils";

function fireCelebration() {
  const count = 80;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

const CATEGORIES = [
  { value: "random", label: "Random" },
  { value: "makanan", label: "Makanan" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Entertainment" },
] as const;

type RoundChoice = { playerIndex: number; option: string };
type RoundResult = { round: number; choices: RoundChoice[] };

type GameState = "settings" | "playing" | "summary";
type GameType = "thisOrThat" | "wouldYouRather";

export default function Home() {
  const [gameType, setGameType] = useState<GameType>("thisOrThat");
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
  const [roundComplete, setRoundComplete] = useState(false);
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
    };
  }, []);

  const fetchRoundOptions = useCallback(async () => {
    setError(null);
    setLoading(true);
    const count = gameType === "wouldYouRather" ? 2 : numOptions;
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, count, gameType }),
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
  }, [category, numOptions, gameType]);

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
      fireCelebration();
      const playerIndex = currentRoundChoices.length + 1;
      const newChoices: RoundChoice[] = [...currentRoundChoices, { playerIndex, option }];
      setCurrentRoundChoices(newChoices);

      if (newChoices.length === numPlayers) {
        const result: RoundResult = { round: currentRound, choices: newChoices };
        setRoundResults((prev) => [...prev, result]);
        setRoundComplete(true);

        if (nextRoundTimeoutRef.current) clearTimeout(nextRoundTimeoutRef.current);
        nextRoundTimeoutRef.current = setTimeout(() => {
          nextRoundTimeoutRef.current = null;
          setRoundComplete(false);
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
        }, 1500);
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
          <div
            className="grid w-full max-w-[280px] grid-cols-2 rounded-lg border border-input bg-muted/30 p-0.5"
            role="group"
            aria-label="Pilih mode game"
          >
            <div className="relative min-w-0">
              {gameType === "thisOrThat" && (
                <motion.div
                  layoutId="game-type-pill"
                  className="absolute inset-0 rounded-md bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "relative z-10 h-9 w-full rounded-md px-3 transition-colors",
                  gameType === "thisOrThat" ? "text-primary-foreground hover:bg-transparent hover:text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setGameType("thisOrThat")}
                disabled={gameState !== "settings"}
              >
                This or That
              </Button>
            </div>
            <div className="relative min-w-0">
              {gameType === "wouldYouRather" && (
                <motion.div
                  layoutId="game-type-pill"
                  className="absolute inset-0 rounded-md bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "relative z-10 h-9 w-full rounded-md px-3 transition-colors",
                  gameType === "wouldYouRather" ? "text-primary-foreground hover:bg-transparent hover:text-primary-foreground" : "text-muted-foreground"
                )}
                onClick={() => setGameType("wouldYouRather")}
                disabled={gameState !== "settings"}
              >
                Would You Rather
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {gameType === "wouldYouRather" ? "Would You Rather" : "This or That"}
          </h1>
          <p className="text-muted-foreground">
            {gameType === "wouldYouRather"
              ? "Pilih yang absurd. Urutan pencet = urutan player. Di akhir ada ringkasan."
              : "Pilih opsi, urutan pencet = urutan player. Di akhir ada ringkasan."}
          </p>
        </div>

        <AnimatePresence mode="wait">
        {gameState === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
          <Card className="card-glow border-primary/10">
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>
                {gameType === "wouldYouRather"
                  ? "Atur jumlah ronde dan jumlah pemain."
                  : "Atur kategori, jumlah opsi, ronde, dan jumlah pemain."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameType === "thisOrThat" && (
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
              )}
              {gameType === "thisOrThat" && (
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
              )}
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
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
          <Card className="card-glow border-primary/10">
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
              {roundComplete && (
                <p className="text-center text-sm font-medium text-muted-foreground">
                  Ronde selesai! Next round in 1.5s…
                </p>
              )}
              {loading && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Array.from({ length: gameType === "wouldYouRather" ? 2 : numOptions }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              )}
              {!loading && options && options.length > 0 && (
                <motion.div
                  className="grid gap-3 sm:grid-cols-2"
                  style={{
                    gridTemplateColumns:
                      options.length <= 2
                        ? "repeat(2, 1fr)"
                        : options.length <= 4
                          ? "repeat(2, 1fr)"
                          : "repeat(3, 1fr)",
                  }}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
                    },
                    hidden: {},
                  }}
                >
                  <AnimatePresence mode="wait">
                    {options.map((opt, idx) => {
                      const chosenBy = currentRoundChoices.filter((c) => c.option === opt);
                      const isChosen = chosenBy.length > 0;
                      return (
                        <motion.div
                          key={`${currentRound}-${idx}-${opt}`}
                          variants={{
                            hidden: { opacity: 0, y: 24, scale: 0.9 },
                            visible: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: { type: "spring", stiffness: 400, damping: 24 },
                            },
                          }}
                        >
                          <motion.div
                            whileHover={currentRoundChoices.length < numPlayers ? { scale: 1.03 } : {}}
                            whileTap={currentRoundChoices.length < numPlayers ? { scale: 0.97 } : {}}
                            animate={isChosen ? { scale: [1, 1.08, 1], boxShadow: ["0 0 0 0 rgba(0,0,0,0)", "0 0 0 8px rgba(255,200,0,0.4)", "0 0 0 0 rgba(0,0,0,0)"] } : {}}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative"
                          >
                            <Button
                              variant={isChosen ? "default" : "outline"}
                              size="lg"
                              className="min-h-16 w-full text-base"
                              onClick={() => handleOptionClick(opt)}
                              disabled={currentRoundChoices.length >= numPlayers}
                            >
                              <span className="text-center">{opt}</span>
                              <span className="ml-2 flex flex-wrap items-center justify-center gap-1">
                                <AnimatePresence>
                                  {chosenBy.map((c) => (
                                    <motion.span
                                      key={c.playerIndex}
                                      initial={{ scale: 0, rotate: -20 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      exit={{ scale: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                      className="inline-flex rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold"
                                    >
                                      P{c.playerIndex}!
                                    </motion.span>
                                  ))}
                                </AnimatePresence>
                              </span>
                            </Button>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}

        {gameState === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
          <Card className="card-glow border-primary/10">
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
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
