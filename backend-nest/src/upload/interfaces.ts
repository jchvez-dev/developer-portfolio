export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadResult {
  success: boolean;
  assetUrl: string;
  sessionId: string;
}
