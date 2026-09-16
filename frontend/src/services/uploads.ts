import { postForm } from "./api";

export interface UploadedImage {
    url: string;
    filename: string;
    contentType: string;
    size: number;
}

export async function uploadImage(
    file: File
): Promise<UploadedImage> {
    const formData = new FormData();

    formData.append("file", file);

    return postForm("/uploads", formData);
}