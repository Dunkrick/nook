import prisma from "../prisma.js";
import type { ObjectStorage } from "../storage/object-storage.js";
import type { PolaroidArtifactContent } from "../domain/artifacts.js";
import { ValidationError } from "../lib/error.js";

const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes

/**
 * Resolve a short-lived signed read URL for a Polaroid artifact's image.
 *
 * Authorization boundary:
 *   1. Artifact must exist.
 *   2. Artifact must belong to the authenticated user.
 *   3. Artifact must be of type POLAROID.
 *   4. Artifact content must contain a valid imageKey.
 *
 * This service depends on the ObjectStorage abstraction — never on
 * @google-cloud/storage directly. Inject a GoogleCloudStorage instance
 * (or a test double) from the route layer.
 */
export async function getArtifactImageUrl(
    artifactId: number,
    userId: number,
    storage: ObjectStorage,
): Promise<string> {
    const artifact = await prisma.artifact.findUnique({
        where: { id: artifactId },
    });

    if (!artifact) {
        throw new ValidationError("Artifact not found.", 404);
    }

    if (artifact.userId !== userId) {
        throw new ValidationError("Forbidden.", 403);
    }

    if (artifact.type !== "POLAROID") {
        throw new ValidationError(
            "This artifact does not have an image.",
            400,
        );
    }

    const content = artifact.content as unknown as PolaroidArtifactContent;

    if (!content?.imageKey) {
        // Do not expose internal storage details in the error message.
        throw new ValidationError("Image not available.", 500);
    }

    return storage.getSignedReadUrl(content.imageKey, SIGNED_URL_TTL_SECONDS);
}
