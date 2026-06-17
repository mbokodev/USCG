import { Button } from "../button";

export interface DrawerButtonProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function DrawerButton({
  onCancel,
  onSubmit,
  submitText = "Enregistrer",
  cancelText = "Annuler",
  isLoading = false,
  isDisabled = false,
}: DrawerButtonProps) {
  return (
    <div className="flex gap-3 pt-4 border-t border-neutral-200 mt-6">
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        className="flex-1"
        onClick={onSubmit}
        isLoading={isLoading}
        disabled={isDisabled}
      >
        {submitText}
      </Button>
    </div>
  );
}
