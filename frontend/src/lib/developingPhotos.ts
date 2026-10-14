/**
 * Development of a new instant photo.
 *
 * A photo uploaded in this session arrives undeveloped and its image fades
 * in. A photo loaded from the wall never develops, because it arrived long
 * ago. Both sets live at module level, so they survive a re-render and start
 * empty on every page load.
 */

const newPhotoIds = new Set<number>();

const developedPhotoIds = new Set<number>();

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Records a photo the user just uploaded. */
export function markPhotoAsNew(artifactId: number) {
    newPhotoIds.add(artifactId);
}

/** Records that a photo already had its one develop pass. */
export function markPhotoAsDeveloped(artifactId: number) {
    developedPhotoIds.add(artifactId);
}

/** True when this photo is new, has not developed yet, and motion is on. */
export function developsOnFirstMount(artifactId: number) {
    return (
        newPhotoIds.has(artifactId) &&
        !developedPhotoIds.has(artifactId) &&
        !prefersReducedMotion()
    );
}
