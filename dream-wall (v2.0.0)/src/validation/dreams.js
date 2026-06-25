export function validateDream(text) {
    const dream = text?.trim();

    if (!dream) {
        return null;
    }

    return dream;
}