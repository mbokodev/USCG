"use client";

import { useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface SingleImageUploadProps {
  value: File | null;
  existingUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  maxSizeMB?: number;
  error?: string;
}

export function SingleImageUpload({
  value,
  existingUrl,
  onChange,
  onRemoveExisting,
  maxSizeMB = 5,
  error,
}: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value ? URL.createObjectURL(value) : null;
  const hasImage = !!value || !!existingUrl;

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      // Check file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      // Check file size
      if (file.size > maxSizeBytes) {
        return;
      }

      onChange(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onChange, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (!file.type.startsWith("image/")) return;
      if (file.size > maxSizeBytes) return;

      onChange(file);
    },
    [onChange, maxSizeMB]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    if (value) {
      onChange(null);
    } else if (existingUrl && onRemoveExisting) {
      onRemoveExisting();
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Image preview or upload zone */}
      {hasImage ? (
        <div className="relative group w-full max-w-xs">
          <div className="aspect-video rounded-xl overflow-hidden bg-neutral-100 border-2 border-neutral-200">
            <img
              src={previewUrl || existingUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          {value && (
            <span className="absolute top-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
              Nouvelle
            </span>
          )}
          {existingUrl && !value && (
            <span className="absolute top-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
              Existante
            </span>
          )}
          {/* Change image button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-700 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            Changer
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors max-w-xs ${
            error
              ? "border-red-300 hover:border-red-400 bg-red-50/50"
              : "border-neutral-300 hover:border-primary hover:bg-primary/5"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
          <p className="text-neutral-600 font-medium text-sm">
            Cliquez ou deposez une image
          </p>
          <p className="text-neutral-400 text-xs mt-1">
            PNG, JPG, WEBP (max {maxSizeMB}Mo)
          </p>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Empty state hint */}
      {!hasImage && !error && (
        <div className="flex items-center gap-2 text-neutral-400 text-xs">
          <ImageIcon className="w-4 h-4" />
          <span>L'image sera affichée dans le carousel</span>
        </div>
      )}
    </div>
  );
}
