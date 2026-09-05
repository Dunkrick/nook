import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useArtifactEditing } from "./useArtifactEditing";

describe("useArtifactEditing", () => {
    it("saves the updated text and exits editing", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onEditingChange = vi.fn();

        const { result } = renderHook(() =>
            useArtifactEditing({
                artifactId: 42,
                initialText: "Original text",
                isEditing: true,
                onUpdate,
                onEditingChange,
            })
        );

        act(() => {
            result.current.setEditText("Updated text");
        });

        await act(async () => {
            await result.current.handleSave();
        });

        expect(onUpdate).toHaveBeenCalledWith(42, {
            text: "Updated text",
        });

        expect(onEditingChange).toHaveBeenCalledWith(false);
    });

    it("does not save empty text", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onEditingChange = vi.fn();

        const { result } = renderHook(() =>
            useArtifactEditing({
                artifactId: 42,
                initialText: "Original text",
                isEditing: true,
                onUpdate,
                onEditingChange,
            })
        );

        act(() => {
            result.current.setEditText("   ");
        });

        await act(async () => {
            await result.current.handleSave();
        });

        expect(onUpdate).not.toHaveBeenCalled();
        expect(onEditingChange).not.toHaveBeenCalled();
    });

    it("restores the original text when editing is cancelled", () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onEditingChange = vi.fn();

        const { result } = renderHook(() =>
            useArtifactEditing({
                artifactId: 42,
                initialText: "Original text",
                isEditing: true,
                onUpdate,
                onEditingChange,
            })
        );

        act(() => {
            result.current.setEditText("Changed text");
        });

        expect(result.current.editText).toBe("Changed text");

        act(() => {
            result.current.handleCancel();
        });

        expect(result.current.editText).toBe("Original text");
        expect(onEditingChange).toHaveBeenCalledWith(false);
    });

    it("syncs external text changes when not editing", () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined);
        const onEditingChange = vi.fn();

        const { result, rerender } = renderHook(
            ({ initialText, isEditing }) =>
                useArtifactEditing({
                    artifactId: 42,
                    initialText,
                    isEditing,
                    onUpdate,
                    onEditingChange,
                }),
            {
                initialProps: {
                    initialText: "Original text",
                    isEditing: false,
                },
            }
        );

        act(() => {
            result.current.setEditText("Local change");
        });

        rerender({
            initialText: "Updated externally",
            isEditing: false,
        });

        expect(result.current.editText).toBe("Updated externally");
    });
});