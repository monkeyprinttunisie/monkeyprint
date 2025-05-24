"use client";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SaveButtonProps {
  onSave?: () => Promise<void> | void;
  disabled?: boolean;
  isSaving?: boolean;
  text?: string;
}

export default function SaveButton({
  onSave,
  disabled = false,
  isSaving: externalIsSaving,
  text = "Save Changes",
}: SaveButtonProps) {
  const [internalIsSaving, setInternalIsSaving] = useState(false);

  const isSaving =
    externalIsSaving !== undefined ? externalIsSaving : internalIsSaving;

  const handleSaveButton = async () => {
    if (!onSave) return;

    try {
      setInternalIsSaving(true);
      await onSave();
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setInternalIsSaving(false);
    }
  };

  return (
    <Button
      className="bg-blue-600 hover:bg-blue-700"
      onClick={handleSaveButton}
      disabled={disabled || isSaving}
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}
