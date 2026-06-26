export function validateDream(text: string) {
    const dream = text?.trim();

    if (!dream) {
        return null;
    }

    return dream;
}