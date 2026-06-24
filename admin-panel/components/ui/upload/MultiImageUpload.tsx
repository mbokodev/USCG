"use client";

import { useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Star, StarOff } from "lucide-react";
import type { ImagePreview, ExistingImage } from "./types";

interface MultiImageUploadProps {
  images: ImagePreview[];
  onChange: (images: ImagePreview[]) => void;
  existingImages?: ExistingImage[];
  onRemoveExisting?: (imageId: string) => void;
  onSetDefault?: (imageId: string) => void;
  onUnsetDefault?: (imageId: string) => void;
  // Props pour sélection default sur nouvelles images (mode CREATE)
  defaultNewIndex?: number | null;
  onSetDefaultNew?: (index: number) => void;
  maxImages?: number;
  maxSizeMB?: number;
  error?: string;
}

export function MultiImageUpload({
  images,
  onChange,
  existingImages = [],
  onRemoveExisting,
  onSetDefault,
  onUnsetDefault,
  defaultNewIndex,
  onSetDefaultNew,
  maxImages = 10,
  maxSizeMB = 5,
  error,
}: MultiImageUploadProps) {
  const totalImages = existingImages.length + images.length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const newImages: ImagePreview[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Check file type
        if (!file.type.startsWith("image/")) continue;
        // Check file size
        if (file.size > maxSizeBytes) continue;

        newImages.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }

      // Merge with existing and limit to max (accounting for existing images)
      const availableSlots = maxImages - existingImages.length;
      const merged = [...images, ...newImages].slice(0, availableSlots);
      onChange(merged);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images, onChange, maxImages, maxSizeMB, existingImages.length]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = [...images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      onChange(newImages);
    },
    [images, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (!files) return;

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const newImages: ImagePreview[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxSizeBytes) continue;

        newImages.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }

      const availableSlots = maxImages - existingImages.length;
      const merged = [...images, ...newImages].slice(0, availableSlots);
      onChange(merged);
    },
    [images, onChange, maxImages, maxSizeMB, existingImages.length]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Upload zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
          error
            ? "border-red-300 hover:border-red-400 bg-red-50/50"
            : "border-neutral-300 hover:border-primary hover:bg-primary/5"
        }`}
      >
        <Upload className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
        <p className="text-neutral-600 font-medium">
          Cliquez ou deposez des photos ici
        </p>
        <p className="text-neutral-400 text-sm mt-1">
          PNG, JPG, WEBP (max {maxSizeMB}Mo par image, max {maxImages} images)
        </p>
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image previews - Existing + New */}
      {totalImages > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing images first */}
          {existingImages.map((img) => (
            <div key={`existing-${img.id}`} className="relative group">
              <div className={`aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 ${img.isDefault ? "border-primary" : "border-green-200"}`}>
                <img
                  src={img.url}
                  alt={img.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(img.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {/* Set as default button */}
              {onSetDefault && !img.isDefault && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(img.id);
                  }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Definir comme principale"
                >
                  <Star className="w-3 h-3" />
                </button>
              )}
              {/* Unset default button */}
              {onUnsetDefault && img.isDefault && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnsetDefault(img.id);
                  }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-neutral-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Retirer comme principale"
                >
                  <StarOff className="w-3 h-3" />
                </button>
              )}
              {img.isDefault && (
                <span className="absolute bottom-2 left-2 text-xs bg-primary text-white px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="w-3 h-3" /> Principale
                </span>
              )}
              <span className="absolute top-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                Existante
              </span>
            </div>
          ))}
          {/* New images */}
          {images.map((img, index) => {
            const isDefaultNew = defaultNewIndex === index;
            return (
              <div key={`new-${index}`} className="relative group">
                <div className={`aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 ${isDefaultNew ? "border-primary" : "border-blue-200"}`}>
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* Bouton étoile pour définir comme principale */}
                {onSetDefaultNew && !isDefaultNew && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefaultNew(index);
                    }}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Definir comme principale"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                {/* Badge "Principale" si sélectionné */}
                {isDefaultNew && (
                  <span className="absolute bottom-2 left-2 text-xs bg-primary text-white px-2 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-3 h-3" /> Principale
                  </span>
                )}
                <span className="absolute top-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                  Nouvelle
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {totalImages === 0 && (
        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
          <ImageIcon className="w-5 h-5 text-neutral-400" />
          <p className="text-sm text-neutral-500">
            Aucune image ajoutee. Les images sont optionnelles mais fortement
            recommandees.
          </p>
        </div>
      )}

      {/* Image count */}
      {totalImages > 0 && (
        <p className="text-sm text-neutral-500">
          {totalImages} / {maxImages} images
          {existingImages.length > 0 && images.length > 0 && (
            <span className="text-neutral-400">
              {" "}({existingImages.length} existantes, {images.length} nouvelles)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
