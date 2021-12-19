<script setup lang="ts">
import { watch } from "vue";
import {
    TextController,
    WordInputStatus,
    WordStatus,
} from "../controller/text";

const { controller } = defineProps<{
    controller: TextController;
}>();

let previousInput = "";

const handleKeydown = (ev: Event) => {
    const target = ev.currentTarget as HTMLFormElement;
    previousInput = target.value as string;
};

const handleKeyUp = (ev: Event) => {
    const target = ev.currentTarget as HTMLFormElement;
    const casted = ev as KeyboardEvent;
    const value = target.value as string;

    if (!casted.key) return;

    let pass = false;

    switch (casted.key) {
        case "Backspace":
            controller.addReceivedWord(
                controller.expectedWordIndex.value,
                value
            );

            if (!value.length && !previousInput.length) {
                controller.setExpectedIndex(
                    controller.expectedWordIndex.value - 1
                );

                target.value =
                    controller.receivedWordAt(
                        controller.expectedWordIndex.value
                    ) ?? "";
            }
            break;

        case "Enter":
            target.value = `${target.value} `;
            pass = true;
            break;
    }

    if (pass) {
        handleInput(ev);
    }
};

const handleInput = (ev: Event) => {
    if (controller.inputStatus.value !== WordInputStatus.started) {
        controller.setInputStatus(WordInputStatus.started);
    }

    const target = ev.currentTarget as HTMLFormElement;
    let value = target.value as string;
    const lastTyped = value.charAt(value.length - 1);

    if (lastTyped == " ") {
        value
            .split(" ")
            .map((x) => x.trim())
            .filter((x) => x.length)
            .forEach((x, i) => {
                controller.addReceivedWord(
                    controller.expectedWordIndex.value + i,
                    x
                );
            });
        controller.setExpectedIndex(controller.receivedWords.length);

        value = "";

        if (
            controller.receivedWords.length === controller.expectedWords.length
        ) {
            controller.setInputStatus(WordInputStatus.ended);
        }
    }

    target.value = value;
};

const getWordClasses = (index: number) => {
    const classes: string[] = [];

    switch (
        controller.getWordStatus(controller.expectedWordIndex.value, index)
    ) {
        case WordStatus.unreceived:
            break;

        case WordStatus.correct:
            classes.push("text-gray-400");
            break;

        case WordStatus.current:
            classes.push("text-amber-500");
            break;

        case WordStatus.incorrect:
            classes.push("text-red-500");
            break;
    }

    return classes;
};

const elementIdentifiers = {
    wordElement: {
        prefix: (Math.random() + 1).toString(36).substring(7),
        get: (index: number) =>
            `${elementIdentifiers.wordElement.prefix}-${index}`,
    },
};

watch(
    () => controller.expectedWordIndex.value,
    () => {
        const element = document.getElementById(
            elementIdentifiers.wordElement.get(
                controller.expectedWordIndex.value
            )
        );

        const parentPosition = element?.parentElement?.getBoundingClientRect();
        const elementPosition = element?.getBoundingClientRect();
        if (parentPosition && elementPosition) {
            const position = elementPosition.top - parentPosition.top;
            const top = 0;
            const bottom = parentPosition.bottom - parentPosition.height;

            if (position < top || position > bottom) {
                element!.scrollIntoView();
            }
        }
    }
);
</script>

<template>
    <div>
        <div
            class="
                min-h-[8rem]
                max-h-[calc(100vh-11rem-4rem)]
                overflow-x-hidden overflow-y-auto
                flex flex-row flex-wrap
            "
        >
            <template v-for="(x, i) in controller.expectedWords">
                <p
                    :class="[...getWordClasses(i), 'mr-3']"
                    :id="elementIdentifiers.wordElement.get(i)"
                >
                    {{ x }}
                </p>
            </template>
        </div>

        <div class="mt-[2rem] h-[4rem]">
            <input
                type="text"
                class="
                    form-border
                    px-4
                    py-3
                    w-full
                    h-[3rem]
                    bg-gray-700
                    rounded-lg
                    resize-none
                "
                @keydown="handleKeydown"
                @keyup="handleKeyUp"
                @input="handleInput"
                :placeholder="
                    controller.expectedWordAt(
                        controller.expectedWordIndex.value
                    ) ?? ''
                "
            />
        </div>
    </div>
</template>
