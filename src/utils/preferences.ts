import { TextDifficulty, TextDifficultyType } from "../data/text";

export class Preferences {
    static setDifficulty(difficulty: TextDifficultyType) {
        localStorage.setItem("last_difficulty", difficulty.toString());
    }

    static getDifficulty() {
        const parsed = localStorage.getItem("last_timelimit");
        return parsed && Object.keys(TextDifficulty).includes(parsed)
            ? TextDifficulty[parsed as TextDifficultyType]
            : null;
    }

    static setTimeLimit(time: number) {
        localStorage.setItem("last_timelimit", time.toString());
    }

    static getTimeLimit() {
        const parsed = parseInt(localStorage.getItem("last_timelimit") ?? "");
        return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
    }
}
