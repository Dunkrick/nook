/**
 * Development of a new instant photo.
 *
 * A photo uploaded in this session arrives undeveloped and its image fades
 * in. A photo loaded from the wall never develops, because it arrived long
 * ago. The set lives on `window` so it survives HMR and module reloads.
 */

declare global {
    interface Window {
        __nookNewPhotoIds: Set<number>;
        __nookDevelopedPhotoIds: Set<number>;
    }
}

function getNewPhotoIds(): Set<number> {
    if (!window.__nookNewPhotoIds) {
        window.__nookNewPhotoIds = new Set<number>();
    }
    return window.__nookNewPhotoIds;
}

function getDevelopedPhotoIds(): Set<number> {
    if (!window.__nookDevelopedPhotoIds) {
        window.__nookDevelopedPhotoIds = new Set<number>();
    }
    return window.__nookDevelopedPhotoIds;
}

function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Records a photo the user just uploaded. */
export function markPhotoAsNew(artifactId: number) {
    getNewPhotoIds().add(artifactId);
}

/** Records that a photo already had its one develop pass. */
export function markPhotoAsDeveloped(artifactId: number) {
    getDevelopedPhotoIds().add(artifactId);
}

/** True when this photo is new, has not developed yet, and motion is on. */
export function developsOnFirstMount(artifactId: number): boolean {
    return (
        getNewPhotoIds().has(artifactId) &&
        !getDevelopedPhotoIds().has(artifactId) &&
        !prefersReducedMotion()
    );
}