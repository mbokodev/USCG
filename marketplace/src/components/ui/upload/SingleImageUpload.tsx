"use client";

import { useRef, useCallback, useState } from "react";
import styled from "styled-components";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";

interface SingleImageUploadProps {
  value: File | null;
  existingUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  maxSizeMB?: number;
  error?: string;
  label?: string;
  hint?: string;
  isUploading?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const UploadZone = styled.div<{ hasError?: boolean; isDragging?: boolean }>`
  border: 2px dashed ${({ theme, hasError, isDragging }) =>
    hasError ? theme.colors.error.main :
    isDragging ? theme.colors.primary.main :
    theme.colors.gray[300]};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ hasError, isDragging }) =>
    hasError ? "rgba(233, 69, 96, 0.05)" :
    isDragging ? "rgba(233, 69, 96, 0.05)" :
    "transparent"};
  max-width: 300px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: rgba(233, 69, 96, 0.05);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
`;

const UploadText = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.25rem 0;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

const PreviewContainer = styled.div`
  position: relative;
  max-width: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};

  &:hover .overlay {
    opacity: 1;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const OverlayButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
`;

const ChangeButton = styled(OverlayButton)`
  background: white;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const RemoveButton = styled(OverlayButton)`
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.error[600] || "#C13550"};
  }
`;

const Badge = styled.span<{ variant: "new" | "existing" }>`
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ variant }) => variant === "new" ? "#2563eb" : "#22c55e"};
  color: white;
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error.main};
  margin: 0;
`;

const HintRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${({ theme }) => theme.colors.gray[200]};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function SingleImageUpload({
  value,
  existingUrl,
  onChange,
  onRemoveExisting,
  maxSizeMB = 5,
  error,
  label,
  hint,
  isUploading,
}: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
      setIsDragging(false);

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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (value) {
      onChange(null);
    } else if (existingUrl && onRemoveExisting) {
      onRemoveExisting();
    }
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: "none" }}
      />

      {hasImage ? (
        <PreviewContainer>
          <PreviewImage src={previewUrl || existingUrl} alt="Preview" />

          {value && <Badge variant="new">Nouvelle</Badge>}
          {existingUrl && !value && <Badge variant="existing">Actuelle</Badge>}

          <Overlay className="overlay">
            <ChangeButton type="button" onClick={() => fileInputRef.current?.click()}>
              Changer
            </ChangeButton>
            <RemoveButton type="button" onClick={handleRemove}>
              <IconX size={18} />
            </RemoveButton>
          </Overlay>

          {isUploading && (
            <LoadingOverlay>
              <Spinner />
            </LoadingOverlay>
          )}
        </PreviewContainer>
      ) : (
        <UploadZone
          hasError={!!error}
          isDragging={isDragging}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <IconWrapper>
            <IconUpload size={24} color="#666" />
          </IconWrapper>
          <UploadText>Cliquez ou déposez une image</UploadText>
          <UploadHint>PNG, JPG, WEBP (max {maxSizeMB}Mo)</UploadHint>
        </UploadZone>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      {!hasImage && !error && hint && (
        <HintRow>
          <IconPhoto size={16} />
          <span>{hint}</span>
        </HintRow>
      )}
    </Container>
  );
}
