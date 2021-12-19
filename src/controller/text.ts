import { ref, reactive, watch } from "vue";
import { Preferences } from "../utils/preferences";

export class TextState {
    constructor(public readonly id: string, public readonly text: string) {}

    static new(text: string) {
        return new TextState(Date.now().toString(), text);
    }
}

export const TimeLimits = [0, 0.5, 1, 2, 3, 4, 5] as const;

export class TimeLimitsUtils {
    static names = TimeLimits.reduce((pv, cv) => {
        let name: string;
        switch (cv) {
            case 0:
                name = "No limit";
                break;

            default:
                name = `${cv} minutes`;
                break;
        }
        pv[cv] = name;
        return pv;
    }, {} as Record<number, string>);

    static getName(kind: number) {
        return this.names[kind]!;
    }

    static getMs(kind: number) {
        return kind * 60 * 1000;
    }

    static getSecs(kind: number) {
        return kind * 60;
    }

    static get default() {
        return TimeLimits[2];
    }
}

export enum WordStatus {
    unreceived,
    current,
    correct,
    incorrect,
}

export enum WordInputStatus {
    unstarted,
    started,
    ended,
}

export class TextController {
    timeLimit = ref<number>(
        Preferences.getTimeLimit() ?? TimeLimitsUtils.default
    );
    inputStatus = ref<WordInputStatus>(WordInputStatus.unstarted);
    receivedWords = reactive<string[]>([]);
    expectedWords: string[];
    expectedWordIndex = ref(0);
    results = ref<ResultStats | null>(null);
    elapsedSeconds = ref<number>(0);
    #elapsedTimer?: ReturnType<typeof setTimeout>;

    constructor(public readonly state: TextState) {
        this.expectedWords = state.text.split(" ");

        watch(
            () => this.timeLimit.value,
            () => void Preferences.setTimeLimit(this.timeLimit.value)
        );
    }

    #updateElapsed() {
        this.elapsedSeconds.value = this.elapsedSeconds.value + 1;
    }

    #start() {
        this.#updateElapsed();
        this.#elapsedTimer = setInterval(() => {
            this.#updateElapsed();

            if (
                this.timeLimit.value > 0 &&
                this.elapsedSeconds.value >=
                    TimeLimitsUtils.getSecs(this.timeLimit.value)
            ) {
                this.setInputStatus(WordInputStatus.ended);
            }
        }, 1000);
    }

    #end() {
        clearInterval(this.#elapsedTimer);
        this.#elapsedTimer = undefined;

        this.results.value = ResultStats.calculate(this);
    }

    setInputStatus(status: WordInputStatus) {
        this.inputStatus.value = status;

        switch (status) {
            case WordInputStatus.started:
                this.#start();
                break;

            case WordInputStatus.ended:
                this.#end();
                break;

            default:
                break;
        }
    }

    setExpectedIndex(index: number) {
        if (index >= 0) {
            if (index < this.expectedWordIndex.value) {
                this.receivedWords.length = index + 1;
            }

            this.expectedWordIndex.value = index;
        }
    }

    expectedWordAt(index: number) {
        return this.expectedWords[index] ?? null;
    }

    receivedWordAt(index: number) {
        return this.receivedWords[index] ?? null;
    }

    addReceivedWord(index: number, word: string) {
        this.receivedWords[index] = word;
    }

    getWordStatus(currentIndex: number, requiredIndex: number) {
        if (currentIndex === requiredIndex) {
            return WordStatus.current;
        }

        if (currentIndex < requiredIndex) {
            return WordStatus.unreceived;
        }

        return this.receivedWordAt(requiredIndex) ===
            this.expectedWordAt(requiredIndex)
            ? WordStatus.correct
            : WordStatus.incorrect;
    }
}

export interface ResultsWordStats {
    correct: number;
    incorrect: number;
    remaining: number;
}

export class ResultStats {
    constructor(
        public readonly _: {
            words: ResultsWordStats;
            timeLimit: number;
            timePlayedSecs: number;
        }
    ) {}

    get tookMinutes() {
        return this._.timePlayedSecs / 60;
    }

    get wpm() {
        return (
            (this._.words.correct + this._.words.incorrect) /
            this.tookMinutes
        ).toFixed(1);
    }

    get effectiveWpm() {
        return (this._.words.correct / this.tookMinutes).toFixed(1);
    }

    get totalWords() {
        return (
            this._.words.correct +
            this._.words.incorrect +
            this._.words.remaining
        );
    }

    static calculate(controller: TextController) {
        const words: ResultsWordStats = {
            correct: 0,
            incorrect: 0,
            remaining: 0,
        };

        controller.expectedWords.forEach((x, i) => {
            const status = controller.getWordStatus(
                controller.expectedWordIndex.value,
                i
            );

            switch (status) {
                case WordStatus.correct:
                    words.correct++;
                    break;

                case WordStatus.incorrect:
                    words.incorrect++;
                    break;

                default:
                    words.remaining++;
                    break;
            }
        });

        return new ResultStats({
            words,
            timeLimit: controller.timeLimit.value,
            timePlayedSecs: controller.elapsedSeconds.value,
        });
    }
}
