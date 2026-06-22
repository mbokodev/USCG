"use server";

import { getAccessToken } from "@/utils/session";

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export interface FileUploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

/**
 * Upload an image file
 */
export async function uploadImageAction(formData: FormData): Promise<FileUploadResult> {
  try {
    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: "Non authentifié" };
    }

    const response = await fetch(`${API_BASE}/api/files/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Erreur lors de l'upload" };
    }

    const data = await response.json();
    return { success: true, file: data.file };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error: "Erreur lors de l'upload" };
  }
}

/**
 * Delete a file
 */
export async function deleteFileAction(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAccessToken();

    if (!token) {
      return { success: false, error: "Non authentifié" };
    }

    const response = await fetch(`${API_BASE}/api/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Erreur lors de la suppression" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
