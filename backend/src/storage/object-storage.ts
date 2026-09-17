export interface StoredObject {
    key: string;
    url: string;
    contentType: string;
    size: number;
}

export interface ObjectStorage {
    upload(
        buffer: Buffer,
        metadata: {
            key: string;
            contentType: string;
        }
    ): Promise<StoredObject>;

    /**
     * Generate a short-lived signed URL that grants read access to a single
     * private object. The caller supplies the TTL; the implementation must not
     * expose any provider-specific concepts to the caller.
     */
    getSignedReadUrl(key: string, expiresInSeconds: number): Promise<string>;
}