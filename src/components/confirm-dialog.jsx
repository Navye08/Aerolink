import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {BeatLoader} from "react-spinners";
import {AlertTriangle} from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete the resource.",
  confirmText = "Delete",
  confirmVariant = "destructive",
  isLoading = false,
  onConfirm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border-strong p-6 shadow-2xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            {confirmVariant === "destructive" && (
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}
            <DialogTitle className="text-base font-semibold text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed pl-12">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs border-border-subtle hover:bg-surface-hover"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs font-semibold shadow-sm"
          >
            {isLoading ? <BeatLoader size={6} color="white" /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
