export interface UploadFile {
    buffer: Buffer;
    originalName: string;
    contentType: string;
    size: number;
}

export interface UploadResult {
    key: string;
    url: string;
    contentType: string;
    size: number;
}