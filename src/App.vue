<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
    TextController,
    TimeLimits,
    TimeLimitsUtils,
    WordInputStatus,
    TextState,
} from "./controller/text";
import { Texts, TextDifficulty, TextDifficultyType } from "./data/text";
import { DurationUtils } from "./utils/duration";
import TextTracker from "./components/TextTracker.vue";
import Results from "./components/Results.vue";
import { Preferences } from "./utils/preferences";

const difficulty = ref(Preferences.getDifficulty() ?? TextDifficulty.easy);
const state = ref(TextState.new(Texts.random(difficulty.value)));
const controller = computed(() => new TextController(state.value));

const setState = (text: string) => {
    state.value = TextState.new(text);
};

const refreshState = () => {
    setState(Texts.random(difficulty.value));
};

const setDifficulty = (diff: TextDifficultyType) => {
    difficulty.value = diff;
    refreshState();
};

const actionButtonText = computed(() => {
    switch (controller.value.inputStatus.value) {
        case WordInputStatus.unstarted:
            return "Start!";

        case WordInputStatus.started:
            return "Stop!";

        case WordInputStatus.ended:
            return "Reset!";
    }
});

const handleActionButtonClick = () => {
    switch (controller.value.inputStatus.value) {
        case WordInputStatus.unstarted:
            controller.value.setInputStatus(WordInputStatus.started);
            break;

        case WordInputStatus.started:
            controller.value.setInputStatus(WordInputStatus.ended);
            break;

        case WordInputStatus.ended:
            refreshState();
            break;
    }
};

const secondsRemaining = computed(
    () =>
        TimeLimitsUtils.getSecs(controller.value.timeLimit.value) -
        controller.value.elapsedSeconds.value
);

watch(
    () => difficulty.value,
    (current, previous) => {
        if (current !== previous) {
            setDifficulty(difficulty.value);
            Preferences.setDifficulty(difficulty.value);
        }
    }
);
</script>

<template>
    <div class="px-8 md:px-28 pt-[2rem] pb-[3rem]">
        <nav
            class="flex flex-col md:flex-row justify-around items-center gap-6"
        >
            <div class="font-bold text-2xl h-[2rem]">
                Type<span class="text-amber-500">Dart</span>
            </div>

            <div
                class="
                    flex
                    justify-center
                    items-center
                    gap-2
                    md:h-[2rem]
                    flex-wrap
                "
            >
                <p
                    :class="[
                        controller.timeLimit.value !== 0 &&
                            secondsRemaining < 10 &&
                            'text-red-500',
                        'mr-2',
                    ]"
                    v-if="
                        controller.inputStatus.value === WordInputStatus.started
                    "
                >
                    {{
                        controller.timeLimit.value !== 0
                            ? DurationUtils.prettySeconds(secondsRemaining)
                            : "♾️"
                    }}
                </p>

                <select
                    class="form-border bg-gray-700 rounded capitalize"
                    v-model="difficulty"
                    v-if="
                        controller.inputStatus.value !== WordInputStatus.started
                    "
                >
                    <template v-for="x in TextDifficulty">
                        <option class="capitalize" :value="x">
                            {{ x }}
                        </option>
                    </template>
                </select>

                <button
                    class="
                        rounded
                        px-2
                        py-[1px]
                        bg-amber-500
                        hover:bg-amber-600
                        transition
                        duration-200
                    "
                    @click="refreshState"
                    v-if="
                        controller.inputStatus.value ===
                        WordInputStatus.unstarted
                    "
                >
                    Refresh
                </button>

                <select
                    class="form-border bg-gray-700 rounded"
                    v-model="controller.timeLimit.value"
                    v-if="
                        controller.inputStatus.value !== WordInputStatus.started
                    "
                >
                    <template v-for="x in TimeLimits">
                        <option :value="x">
                            {{ TimeLimitsUtils.getName(x) }}
                        </option>
                    </template>
                </select>

                <button
                    class="
                        rounded
                        px-2
                        py-[1px]
                        bg-amber-500
                        hover:bg-amber-600
                        transition
                        duration-200
                    "
                    @click="handleActionButtonClick"
                >
                    {{ actionButtonText }}
                </button>
            </div>
        </nav>

        <main class="mt-[2rem]">
            <Results
                :controller="controller"
                v-if="
                    controller.inputStatus.value === WordInputStatus.ended &&
                    controller.results.value !== null
                "
            />
            <TextTracker
                :key="controller.state.id"
                :controller="controller"
                v-else
            />
        </main>
    </div>
</template>
