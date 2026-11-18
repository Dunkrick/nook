import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSend, mockGetSignedUrl } = vi.hoisted(() => ({
    mockSend: vi.fn(),
    mockGetSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => {
    class MockS3Client {
        send = mockSend;
    }
    class MockPutObjectCommand {
        constructor(public input: unknown) {}
    }
    class MockGetObjectCommand {
        constructor(public input: unknown) {}
    }
    return {
        S3Client: MockS3Client,
        PutObjectCommand: MockPutObjectCommand,
        GetObjectCommand: MockGetObjectCommand,
    };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: mockGetSignedUrl,
}));

import { S3Storage } from "./s3-storage.js";

describe("S3Storage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("uploads an image buffer to S3 and returns metadata", async () => {
        mockSend.mockResolvedValue({});
        const storage = new S3Storage({ bucketName: "nook-test-bucket" });

        const buffer = Buffer.from("fake-image-bytes");
        const result = await storage.upload(buffer, {
            key: "uploads/users/1/polaroid.jpg",
            contentType: "image/jpeg",
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        const [sentCommand] = mockSend.mock.calls[0];
        expect(sentCommand.input).toEqual({
            Bucket: "nook-test-bucket",
            Key: "uploads/users/1/polaroid.jpg",
            Body: buffer,
            ContentType: "image/jpeg",
        });

        expect(result).toEqual({
            key: "uploads/users/1/polaroid.jpg",
            url: "s3://nook-test-bucket/uploads/users/1/polaroid.jpg",
            contentType: "image/jpeg",
            size: buffer.length,
        });
    });

    it("generates a signed read URL with the specified TTL", async () => {
        mockGetSignedUrl.mockResolvedValue(
            "https://nook-test-bucket.s3.amazonaws.com/uploads/users/1/polaroid.jpg?signed=true"
        );

        const storage = new S3Storage({ bucketName: "nook-test-bucket" });
        const url = await storage.getSignedReadUrl(
            "uploads/users/1/polaroid.jpg",
            900
        );

        expect(mockGetSignedUrl).toHaveBeenCalledTimes(1);
        const [, command, options] = mockGetSignedUrl.mock.calls[0];
        expect(command.input).toEqual({
            Bucket: "nook-test-bucket",
            Key: "uploads/users/1/polaroid.jpg",
        });
        expect(options).toEqual({ expiresIn: 900 });
        expect(url).toBe(
            "https://nook-test-bucket.s3.amazonaws.com/uploads/users/1/polaroid.jpg?signed=true"
        );
    });
});
