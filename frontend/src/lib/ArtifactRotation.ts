export const ARTIFACT_ROTATIONS = [
    -2,
    1.5,
    3,
    -1,
    2.5,
    -1.5
] as const;

// Keep the slight imperfections attached to an artifact, rather than to its
// current list position. Deleting a card should not make every other card
// visibly rotate into a new identity.
export function getArtifactRotation(artifactId: number) {
    return ARTIFACT_ROTATIONS[Math.abs(artifactId) % ARTIFACT_ROTATIONS.length];
}

export function getArtifactColorToken(artifactId: number) {
    return (Math.abs(artifactId) % 4) + 1;
}
