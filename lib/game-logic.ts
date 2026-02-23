/**
 * Pure game logic functions extracted for testability.
 * These mirror the logic in app/page.tsx but are decoupled from React state.
 */

export type RoundChoice = { playerIndex: number; option: string };
export type RoundResult = { round: number; question?: string; choices: RoundChoice[] };

export interface GameConfig {
    numPlayers: number;
    numRounds: number;
}

export interface GameState {
    currentRound: number;
    currentRoundChoices: RoundChoice[];
    roundResults: RoundResult[];
    roundComplete: boolean;
}

/**
 * Creates the initial game state for a new game.
 */
export function createInitialGameState(): GameState {
    return {
        currentRound: 1,
        currentRoundChoices: [],
        roundResults: [],
        roundComplete: false,
    };
}

/**
 * Adds a player choice to the current round.
 * Returns the new choices array, or null if the choice is invalid
 * (round already complete, or all players already chose).
 */
export function addPlayerChoice(
    currentChoices: RoundChoice[],
    option: string,
    numPlayers: number,
    roundComplete: boolean
): RoundChoice[] | null {
    if (roundComplete || currentChoices.length >= numPlayers) {
        return null;
    }

    const playerIndex = currentChoices.length + 1;
    return [...currentChoices, { playerIndex, option }];
}

/**
 * Checks if all players have made their choice for the current round.
 */
export function isRoundComplete(choices: RoundChoice[], numPlayers: number): boolean {
    return choices.length >= numPlayers;
}

/**
 * Creates a RoundResult with all required fields including question.
 */
export function createRoundResult(
    round: number,
    question: string | null | undefined,
    choices: RoundChoice[]
): RoundResult {
    return {
        round,
        question: question ?? undefined,
        choices,
    };
}

/**
 * Determines whether the game should advance to the next round or end.
 * Returns true if there are more rounds to play.
 */
export function shouldAdvanceRound(currentRound: number, numRounds: number): boolean {
    return currentRound < numRounds;
}

/**
 * Determines whether the timer-based auto-complete should fire.
 * Prevents double-recording when all players have already chosen.
 */
export function shouldTimerRecordRound(
    roundComplete: boolean,
    choicesCount: number,
    numPlayers: number
): boolean {
    return !roundComplete && choicesCount < numPlayers;
}
