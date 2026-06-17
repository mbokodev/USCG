// Types for image upload components

export interface ImagePreview {
  file: File;
  preview: string;
}

export interface ExistingImage {
  id: string;
  url: string;
  originalName: string;
  isDefault?: boolean;
}
