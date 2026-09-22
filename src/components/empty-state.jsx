import {Button} from "@/components/ui/button";
import {Link2, Plus} from "lucide-react";

export default function EmptyState({
  title = "No links created yet",
  description = "Create your first branded short link to start tracking clicks, devices, and geolocation analytics.",
  actionLabel = "Create Link",
  onAction,
  icon: Icon = Link2,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dashed border-border-subtle rounded-2xl bg-surface/40 backdrop-blur-sm">
      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-primary mb-4 shadow-inner">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-muted-foreground max-w-sm text-xs mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {onSecondaryAction && secondaryActionLabel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSecondaryAction}
            className="text-xs border-border-subtle hover:bg-surface-hover text-muted-foreground hover:text-foreground"
          >
            {secondaryActionLabel}
          </Button>
        )}
        {onAction && (
          <Button
            size="sm"
            onClick={onAction}
            className="bg-primary hover:bg-blue-500 text-white gap-1.5 text-xs font-medium shadow-sm shadow-blue-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
