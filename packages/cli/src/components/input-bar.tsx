import { StatusBar } from "./status-bar.tsx";
import { type KeyBinding, defaultTextareaKeyBindings, type TextareaRenderable } from "@opentui/core";
import {CommandMenu} from "./command-menu";
import { useRef, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import { useCommandMenu } from "./command-menu/use-commande-menu";
import type {Command} from "./command-menu/types.ts";
type Props = {
    onSubmit: (text: string) => void;
    disabled?: boolean;
};

// On retire les comportements 'newline' et 'submit' de base pour mettre les nôtres
const BASE_BINDINGS = defaultTextareaKeyBindings.filter(
    (kb) => kb.action !== "newline" && kb.action !== "submit"
);

export const TEXTAREA_KEY_BINDINGS: KeyBinding[] = [
    ...BASE_BINDINGS,
    // Enter = submit
    { name: "return", action: "submit" },
    { name: "enter", action: "submit" },
    // Shift+Enter / Alt+Enter = newline (Mac terminal souvent n'envoie pas le Shift)
    { name: "return", shift: true, action: "newline" },
    { name: "enter", shift: true, action: "newline" },
    { name: "return", meta: true, action: "newline" }, // Option+Enter sur Mac
    { name: "enter", meta: true, action: "newline" },
];

export function InputBar({ onSubmit, disabled = false }: Props) {
    const textareaRef = useRef<TextareaRenderable>(null);
    const onSubmitRef = useRef<() => void>(() => {});
    const renderer = useRenderer();

    const {
        showCommandMenu,
        commandQuery,
        selectedIndex,
        scrollRef,
        handleContentChange,
        resolveCommand,
        setSelectedIndex,
    } = useCommandMenu();

    const handleTextareaContentChange = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        handleContentChange(textarea.plainText);
    }, []);

    const handleSubmit = useCallback(() => {
        if (disabled) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        const text = textarea.plainText.trim();
        if (text.length === 0) return;

        onSubmit(text);
        textarea.setText("");
    }, [disabled, onSubmit])

    const handleCommand = useCallback((
        command: Command | undefined
    ) => {
        const textarea = textareaRef.current;
        if (!textarea || !command) return;

        textarea.setText("");

        if (command.action) {
            command.action({
                exit: () => renderer.destroy(),
            });
        } else {
            textarea.insertText(command.value + " ");
        }
    }, [renderer]);

    const handleCommandExecute = useCallback(
        (index: number) => {
            const command = resolveCommand(index);
            handleCommand(command);
        },
        [resolveCommand, handleCommand],
    );

    // Wire up textarea submit handler once so it always reads the latest state.
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.onSubmit = () => {
            onSubmitRef.current();
        };
    }, []);

    onSubmitRef.current = () => {
        if (disabled) return;

        if (showCommandMenu) {
            const command = resolveCommand(selectedIndex);
            handleCommand(command);
            return;
        }

        handleSubmit();
    };

    return (
        <box width="100%" alignItems="center">
            <box
                border={["left"]}
                borderColor="cyan"
                width="100%"
            >
                <box
                    position="relative"
                    justifyContent="center"
                    paddingX={2}
                    paddingY={1}
                    backgroundColor="#1A1A24"
                    width="100%"
                    gap={1}
                >
                    {showCommandMenu && (
                        <box
                            position="absolute"
                            bottom="100%"
                            left={0}
                            width="100%"
                            backgroundColor="#1A1A24"
                            zIndex={10}
                        >
                            <CommandMenu
                                query={commandQuery}
                                selectedIndex={selectedIndex}
                                scrollRef={scrollRef}
                                onSelect={setSelectedIndex}
                                onExecute={handleCommandExecute}
                            />
                        </box>
                    )}
                    <textarea
                        ref={textareaRef}
                        focused={!disabled}
                        keyBindings={TEXTAREA_KEY_BINDINGS}
                        onContentChange={handleTextareaContentChange}
                        placeholder={`Ask anything... "Fix a bug in the database"`}
                    />
                    <StatusBar />
                </box>
            </box>
        </box>
    );
}