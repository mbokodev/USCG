import { http } from "@/shared/api/http";
import { getFileUrl as getFileUrlShared } from "@uscg/shared/utils";

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  type: "IMAGE" | "DOCUMENT";
  isDefault: boolean;
  adId?: string;
  userId: string;
  createdAt: string;
}

export interface UploadResponse {
  message: string;
  file: UploadedFile;
}

const filesService = {
  /**
   * Upload an image file
   */
  uploadImage: async (file: File, adId?: string): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);
    if (adId) {
      formData.append("adId", adId);
    }

    const response = await http.post<UploadResponse>("/files/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.file;
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files: File[], adId?: string): Promise<UploadedFile[]> => {
    const uploadPromises = files.map((file) => filesService.uploadImage(file, adId));
    return Promise.all(uploadPromises);
  },

  /**
   * Link a file to an ad
   */
  linkToAd: async (fileId: string, adId: string): Promise<UploadedFile> => {
    const response = await http.post<UploadedFile>(`/files/${fileId}/link`, { adId });
    return response.data;
  },

  /**
   * Link multiple files to an ad
   */
  linkFilesToAd: async (fileIds: string[], adId: string): Promise<UploadedFile[]> => {
    const linkPromises = fileIds.map((fileId) => filesService.linkToAd(fileId, adId));
    return Promise.all(linkPromises);
  },

  /**
   * Get files for an ad
   */
  getByAd: async (adId: string): Promise<UploadedFile[]> => {
    const response = await http.get<UploadedFile[]>(`/files/ad/${adId}`);
    return response.data;
  },

  /**
   * Get my unlinked files
   */
  getMyFiles: async (): Promise<UploadedFile[]> => {
    const response = await http.get<UploadedFile[]>("/files/my-files");
    return response.data;
  },

  /**
   * Delete a file
   */
  delete: async (fileId: string): Promise<void> => {
    await http.delete(`/files/${fileId}`);
  },

  /**
   * Set a file as the default image for an ad
   */
  setDefault: async (fileId: string, adId: string): Promise<void> => {
    await http.patch(`/files/${fileId}/set-default`, { adId });
  },

  /**
   * Remove default status from an image
   */
  unsetDefault: async (fileId: string, adId: string): Promise<void> => {
    await http.patch(`/files/${fileId}/unset-default`, { adId });
  },

  /**
   * Get file URL (uses shared utility)
   */
  getFileUrl: (file: { filename: string; type?: string; mimeType?: string }): string => {
    return getFileUrlShared(file);
  },
};

export default filesService;
