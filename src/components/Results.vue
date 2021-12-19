<script setup lang="ts">
import { TextController } from "../controller/text";
import { DurationUtils } from "../utils/duration";

const { controller } = defineProps<{
    controller: TextController;
}>();

const results = controller.results.value!;
</script>

<template>
    <div class="pt-10 min-h-[22rem] flex flex-col justify-around items-center">
        <div class="r-wrapper">
            <div>
                <p class="r-title">WPM</p>
                <p class="r-value">{{ results.wpm }}</p>
            </div>

            <div>
                <p class="r-title">Effective WPM</p>
                <p class="r-value">{{ results.effectiveWpm }}</p>
            </div>
        </div>

        <hr class="r-hr" />

        <div class="r-wrapper">
            <div>
                <p class="r-title">Correct Words</p>
                <p class="r-value">{{ results._.words.correct }}</p>
            </div>

            <div>
                <p class="r-title">Wrong Words</p>
                <p class="r-value">{{ results._.words.incorrect }}</p>
            </div>

            <div>
                <p class="r-title">Words Typed</p>
                <p class="r-value">
                    {{ results._.words.correct + results._.words.incorrect }}
                </p>
            </div>

            <div>
                <p class="r-title">Total Words</p>
                <p class="r-value">{{ results.totalWords }}</p>
            </div>
        </div>

        <hr class="r-hr" />

        <div class="r-wrapper">
            <div>
                <p class="r-title">Time Played</p>
                <p class="r-value">
                    {{ DurationUtils.prettySeconds(results._.timePlayedSecs) }}
                </p>
            </div>

            <div>
                <p class="r-title">Max. Time limit</p>
                <p class="r-value">
                    <template v-if="results._.timeLimit !== 0">
                        {{ results._.timeLimit
                        }}<span class="r-small">mins.</span>
                    </template>
                    <template v-else>♾️</template>
                </p>
            </div>
        </div>
    </div>
</template>

<style>
.r-wrapper {
    @apply flex flex-row justify-around items-center flex-wrap gap-10 md:gap-20 flex-1;
}

.r-title {
    @apply text-amber-500 text-lg;
}

.r-value {
    @apply text-5xl text-center;
}

.r-small {
    @apply ml-2 text-base;
}

.r-hr {
    @apply w-full border-gray-700 my-8;
}
</style>
