import { postForm } from "./api";

export interface UploadedImage {
    key: string;
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

    const response = await postForm<{ success: boolean; data: UploadedImage }>(
        "/uploads",
        formData
    );

    return response.data;
}