import {Button} from "@/components/ui/button";
import {Link2, Plus} from "lucide-react";

export default function EmptyState({
  title = "No links created yet",
  description = "Create your first branded short link to start tracking clicks, devices, and geolocation analytics.",
  actionLabel = "Create Link",
  onAction,
  icon: Icon = Link2,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/40">
      <div className="p-4 bg-gray-800/80 rounded-2xl mb-4 text-blue-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md text-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
