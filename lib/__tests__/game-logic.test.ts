import { describe, it, expect } from "vitest";
import {
    createInitialGameState,
    addPlayerChoice,
    isRoundComplete,
    createRoundResult,
    shouldAdvanceRound,
    shouldTimerRecordRound,
} from "../game-logic";

// ─── createInitialGameState ────────────────────────────────────

describe("createInitialGameState", () => {
    it("returns correct initial values", () => {
        const state = createInitialGameState();
        expect(state.currentRound).toBe(1);
        expect(state.currentRoundChoices).toEqual([]);
        expect(state.roundResults).toEqual([]);
        expect(state.roundComplete).toBe(false);
    });
});

// ─── addPlayerChoice ───────────────────────────────────────────

describe("addPlayerChoice", () => {
    it("adds the first player choice with playerIndex 1", () => {
        const result = addPlayerChoice([], "Pizza", 2, false);
        expect(result).toEqual([{ playerIndex: 1, option: "Pizza" }]);
    });

    it("adds second player choice with playerIndex 2", () => {
        const existing = [{ playerIndex: 1, option: "Pizza" }];
        const result = addPlayerChoice(existing, "Sushi", 2, false);
        expect(result).toEqual([
            { playerIndex: 1, option: "Pizza" },
            { playerIndex: 2, option: "Sushi" },
        ]);
    });

    it("adds up to 3 player choices for 3-player game", () => {
        let choices = addPlayerChoice([], "A", 3, false)!;
        choices = addPlayerChoice(choices, "B", 3, false)!;
        choices = addPlayerChoice(choices, "C", 3, false)!;
        expect(choices).toHaveLength(3);
        expect(choices[0].playerIndex).toBe(1);
        expect(choices[1].playerIndex).toBe(2);
        expect(choices[2].playerIndex).toBe(3);
    });

    it("adds up to 4 player choices for 4-player game", () => {
        let choices = addPlayerChoice([], "A", 4, false)!;
        choices = addPlayerChoice(choices, "B", 4, false)!;
        choices = addPlayerChoice(choices, "C", 4, false)!;
        choices = addPlayerChoice(choices, "D", 4, false)!;
        expect(choices).toHaveLength(4);
        expect(choices[3].playerIndex).toBe(4);
    });

    it("returns null when all players have already chosen (2 players)", () => {
        const full = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
        ];
        const result = addPlayerChoice(full, "C", 2, false);
        expect(result).toBeNull();
    });

    it("returns null when all players have already chosen (3 players)", () => {
        const full = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
            { playerIndex: 3, option: "C" },
        ];
        const result = addPlayerChoice(full, "D", 3, false);
        expect(result).toBeNull();
    });

    it("returns null when all players have already chosen (4 players)", () => {
        const full = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
            { playerIndex: 3, option: "C" },
            { playerIndex: 4, option: "D" },
        ];
        const result = addPlayerChoice(full, "E", 4, false);
        expect(result).toBeNull();
    });

    it("returns null when roundComplete is true (race condition guard)", () => {
        const result = addPlayerChoice([], "A", 2, true);
        expect(result).toBeNull();
    });

    it("returns null when roundComplete is true even with empty choices", () => {
        const result = addPlayerChoice([], "A", 4, true);
        expect(result).toBeNull();
    });

    it("allows multiple players to pick the same option", () => {
        let choices = addPlayerChoice([], "Pizza", 2, false)!;
        choices = addPlayerChoice(choices, "Pizza", 2, false)!;
        expect(choices).toHaveLength(2);
        expect(choices[0].option).toBe("Pizza");
        expect(choices[1].option).toBe("Pizza");
    });
});

// ─── isRoundComplete ───────────────────────────────────────────

describe("isRoundComplete", () => {
    it("returns false when no choices made (2 players)", () => {
        expect(isRoundComplete([], 2)).toBe(false);
    });

    it("returns false when only 1 of 2 players has chosen", () => {
        expect(isRoundComplete([{ playerIndex: 1, option: "A" }], 2)).toBe(false);
    });

    it("returns true when 2 of 2 players have chosen", () => {
        const choices = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
        ];
        expect(isRoundComplete(choices, 2)).toBe(true);
    });

    it("returns false when only 2 of 3 players have chosen", () => {
        const choices = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
        ];
        expect(isRoundComplete(choices, 3)).toBe(false);
    });

    it("returns true when 3 of 3 players have chosen", () => {
        const choices = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
            { playerIndex: 3, option: "C" },
        ];
        expect(isRoundComplete(choices, 3)).toBe(true);
    });

    it("returns true when 4 of 4 players have chosen", () => {
        const choices = [
            { playerIndex: 1, option: "A" },
            { playerIndex: 2, option: "B" },
            { playerIndex: 3, option: "C" },
            { playerIndex: 4, option: "D" },
        ];
        expect(isRoundComplete(choices, 4)).toBe(true);
    });

    it("returns true for 1-player game with 1 choice", () => {
        expect(isRoundComplete([{ playerIndex: 1, option: "A" }], 1)).toBe(true);
    });
});

// ─── createRoundResult ─────────────────────────────────────────

describe("createRoundResult", () => {
    it("creates result with question string", () => {
        const choices = [{ playerIndex: 1, option: "A" }];
        const result = createRoundResult(1, "Which one?", choices);
        expect(result).toEqual({
            round: 1,
            question: "Which one?",
            choices,
        });
    });

    it("creates result with undefined question when null is passed", () => {
        const choices = [{ playerIndex: 1, option: "A" }];
        const result = createRoundResult(2, null, choices);
        expect(result.question).toBeUndefined();
    });

    it("creates result with undefined question when undefined is passed", () => {
        const choices = [{ playerIndex: 1, option: "A" }];
        const result = createRoundResult(3, undefined, choices);
        expect(result.question).toBeUndefined();
    });

    it("preserves all player choices in result", () => {
        const choices = [
            { playerIndex: 1, option: "Pizza" },
            { playerIndex: 2, option: "Sushi" },
            { playerIndex: 3, option: "Burger" },
        ];
        const result = createRoundResult(1, "Makanan apa?", choices);
        expect(result.choices).toHaveLength(3);
        expect(result.choices).toEqual(choices);
    });
});

// ─── shouldAdvanceRound ────────────────────────────────────────

describe("shouldAdvanceRound", () => {
    it("returns true when current round < total rounds", () => {
        expect(shouldAdvanceRound(1, 5)).toBe(true);
        expect(shouldAdvanceRound(3, 5)).toBe(true);
        expect(shouldAdvanceRound(4, 5)).toBe(true);
    });

    it("returns false when current round equals total rounds", () => {
        expect(shouldAdvanceRound(5, 5)).toBe(false);
        expect(shouldAdvanceRound(10, 10)).toBe(false);
    });

    it("returns false when current round exceeds total rounds", () => {
        expect(shouldAdvanceRound(6, 5)).toBe(false);
    });
});

// ─── shouldTimerRecordRound ────────────────────────────────────

describe("shouldTimerRecordRound", () => {
    it("returns true when round is not complete and not all players chose", () => {
        expect(shouldTimerRecordRound(false, 0, 2)).toBe(true);
        expect(shouldTimerRecordRound(false, 1, 3)).toBe(true);
    });

    it("returns false when roundComplete is true (already recorded)", () => {
        expect(shouldTimerRecordRound(true, 0, 2)).toBe(false);
        expect(shouldTimerRecordRound(true, 2, 2)).toBe(false);
    });

    it("returns false when all players have already chosen (prevents double-recording)", () => {
        expect(shouldTimerRecordRound(false, 2, 2)).toBe(false);
        expect(shouldTimerRecordRound(false, 3, 3)).toBe(false);
        expect(shouldTimerRecordRound(false, 4, 4)).toBe(false);
    });
});

// ─── Integration: Full multi-player round flow ────────────────

describe("Full round flow simulation", () => {
    it("simulates a complete 2-player round", () => {
        const state = createInitialGameState();
        expect(isRoundComplete(state.currentRoundChoices, 2)).toBe(false);

        // Player 1 chooses
        const after1 = addPlayerChoice(state.currentRoundChoices, "Bali", 2, false)!;
        expect(after1).not.toBeNull();
        expect(isRoundComplete(after1, 2)).toBe(false);

        // Player 2 chooses
        const after2 = addPlayerChoice(after1, "Tokyo", 2, false)!;
        expect(after2).not.toBeNull();
        expect(isRoundComplete(after2, 2)).toBe(true);

        // Create result
        const result = createRoundResult(1, "Kemana kamu mau pergi?", after2);
        expect(result.round).toBe(1);
        expect(result.question).toBe("Kemana kamu mau pergi?");
        expect(result.choices).toHaveLength(2);

        // No more choices allowed
        expect(addPlayerChoice(after2, "Paris", 2, false)).toBeNull();

        // Timer should NOT record (all players chose)
        expect(shouldTimerRecordRound(false, after2.length, 2)).toBe(false);
    });

    it("simulates a complete 3-player round", () => {
        let choices = addPlayerChoice([], "A", 3, false)!;
        expect(isRoundComplete(choices, 3)).toBe(false);

        choices = addPlayerChoice(choices, "B", 3, false)!;
        expect(isRoundComplete(choices, 3)).toBe(false);

        choices = addPlayerChoice(choices, "C", 3, false)!;
        expect(isRoundComplete(choices, 3)).toBe(true);

        expect(addPlayerChoice(choices, "D", 3, false)).toBeNull();
        expect(shouldTimerRecordRound(false, choices.length, 3)).toBe(false);
    });

    it("simulates a complete 4-player round", () => {
        let choices = addPlayerChoice([], "W", 4, false)!;
        choices = addPlayerChoice(choices, "X", 4, false)!;
        choices = addPlayerChoice(choices, "Y", 4, false)!;
        expect(isRoundComplete(choices, 4)).toBe(false);

        choices = addPlayerChoice(choices, "Z", 4, false)!;
        expect(isRoundComplete(choices, 4)).toBe(true);

        expect(addPlayerChoice(choices, "extra", 4, false)).toBeNull();
        expect(shouldTimerRecordRound(false, choices.length, 4)).toBe(false);
    });

    it("simulates timer expiry with incomplete choices (2 of 3 players)", () => {
        let choices = addPlayerChoice([], "A", 3, false)!;
        choices = addPlayerChoice(choices, "B", 3, false)!;
        // Timer expires — only 2 of 3 chose
        expect(shouldTimerRecordRound(false, choices.length, 3)).toBe(true);

        // Timer records the round
        const result = createRoundResult(1, "Question?", choices);
        expect(result.choices).toHaveLength(2);

        // After recording, roundComplete = true, no more clicks allowed
        expect(addPlayerChoice(choices, "C", 3, true)).toBeNull();
    });

    it("simulates round advancement across multiple rounds", () => {
        expect(shouldAdvanceRound(1, 5)).toBe(true);
        expect(shouldAdvanceRound(2, 5)).toBe(true);
        expect(shouldAdvanceRound(5, 5)).toBe(false); // game ends
    });
});
