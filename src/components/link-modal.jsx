import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import {createLink, updateLink} from "@/services/linkService";
import {validateUrl, validateAlias, validateExpiration} from "@/lib/validators";
import {BeatLoader} from "react-spinners";
import {Lock, Calendar, Tag, ShieldCheck, FileText, Globe} from "lucide-react";

export default function LinkModal({
  isOpen,
  onOpenChange,
  mode = "create", // "create" or "edit"
  initialData = null,
  userId,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    title: "",
    destinationUrl: "",
    customAlias: "",
    tagsString: "",
    notes: "",
    expiresAt: "",
    maxClicks: "",
    password: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Synchronize initial data when opening for Edit or Duplicate
  useEffect(() => {
    if (initialData) {
      let formattedExpiry = "";
      if (initialData.expires_at) {
        try {
          const d = new Date(initialData.expires_at);
          formattedExpiry = d.toISOString().slice(0, 16);
        } catch {
          formattedExpiry = "";
        }
      }

      setFormData({
        title: initialData.title || "",
        destinationUrl: initialData.original_url || initialData.destinationUrl || "",
        customAlias: initialData.custom_url || initialData.customAlias || "",
        tagsString: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : "",
        notes: initialData.notes || "",
        expiresAt: formattedExpiry,
        maxClicks: initialData.max_clicks ? String(initialData.max_clicks) : "",
        password: "",
        isActive: initialData.is_active !== false,
      });
    } else {
      setFormData({
        title: "",
        destinationUrl: "",
        customAlias: "",
        tagsString: "",
        notes: "",
        expiresAt: "",
        maxClicks: "",
        password: "",
        isActive: true,
      });
    }
    setErrors({});
    setApiError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const {id, value, type, checked} = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (errors[id]) {
      setErrors((prev) => ({...prev, [id]: null}));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrors({});
    setApiError(null);

    // 1. Validate destination URL
    const urlRes = validateUrl(formData.destinationUrl);
    if (!urlRes.isValid) {
      setErrors((prev) => ({...prev, destinationUrl: urlRes.error}));
      return;
    }

    // 2. Validate custom alias if provided
    if (formData.customAlias) {
      const aliasRes = validateAlias(formData.customAlias);
      if (!aliasRes.isValid) {
        setErrors((prev) => ({...prev, customAlias: aliasRes.error}));
        return;
      }
    }

    // 3. Validate expiration date if provided
    if (formData.expiresAt) {
      const expiryRes = validateExpiration(formData.expiresAt);
      if (!expiryRes.isValid) {
        setErrors((prev) => ({...prev, expiresAt: expiryRes.error}));
        return;
      }
    }

    // Parse tags array
    const tagsArray = formData.tagsString
      ? formData.tagsString
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    setLoading(true);

    try {
      if (mode === "edit" && initialData?.id) {
        const updated = await updateLink(initialData.id, {
          title: formData.title || urlRes.normalizedUrl.slice(0, 30),
          original_url: urlRes.normalizedUrl,
          custom_url: formData.customAlias ? formData.customAlias.trim().toLowerCase() : null,
          tags: tagsArray,
          notes: formData.notes,
          is_active: formData.isActive,
          expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          max_clicks: formData.maxClicks ? parseInt(formData.maxClicks, 10) : null,
          ...(formData.password ? {password: formData.password} : {}),
        });

        if (onSuccess) onSuccess(updated);
      } else {
        const created = await createLink({
          title: formData.title || urlRes.normalizedUrl.slice(0, 30),
          destinationUrl: urlRes.normalizedUrl,
          customAlias: formData.customAlias,
          userId,
          isActive: formData.isActive,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          maxClicks: formData.maxClicks ? parseInt(formData.maxClicks, 10) : null,
          password: formData.password || null,
          tags: tagsArray,
          notes: formData.notes,
        });

        if (onSuccess) onSuccess(created);
      }

      onOpenChange(false);
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            {mode === "edit" ? "Edit Short Link" : "Create New Short Link"}
          </DialogTitle>
          <p className="text-sm text-gray-400">
            Configure your destination URL, custom alias, security, and expiration rules.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {apiError && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {apiError}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1">
            <label htmlFor="title" className="text-xs font-semibold text-gray-300">
              Link Title
            </label>
            <Input
              id="title"
              placeholder="e.g. Developer Portfolio, Summer Campaign"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Destination URL Input */}
          <div className="space-y-1">
            <label htmlFor="destinationUrl" className="text-xs font-semibold text-gray-300">
              Destination URL <span className="text-red-400">*</span>
            </label>
            <Input
              id="destinationUrl"
              placeholder="https://yourlongwebsite.com/resource/page"
              value={formData.destinationUrl}
              onChange={handleChange}
              className={errors.destinationUrl ? "border-red-500" : ""}
            />
            {errors.destinationUrl && (
              <span className="text-xs text-red-400">{errors.destinationUrl}</span>
            )}
          </div>

          {/* Custom Alias */}
          <div className="space-y-1">
            <label htmlFor="customAlias" className="text-xs font-semibold text-gray-300">
              Custom Alias (Optional)
            </label>
            <div className="flex items-center gap-2">
              <Card className="px-3 py-2 text-xs text-gray-400 bg-gray-800 border-gray-700 select-none">
                {typeof window !== "undefined" ? window.location.host : "aerolink.in"}/
              </Card>
              <Input
                id="customAlias"
                placeholder="my-custom-slug"
                value={formData.customAlias}
                onChange={handleChange}
                className={`flex-1 ${errors.customAlias ? "border-red-500" : ""}`}
              />
            </div>
            {errors.customAlias && (
              <span className="text-xs text-red-400">{errors.customAlias}</span>
            )}
          </div>

          {/* Collapsible Advanced Settings (Grid) */}
          <div className="pt-2 border-t border-gray-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Advanced Controls & Security
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Expiration Date */}
              <div className="space-y-1">
                <label
                  htmlFor="expiresAt"
                  className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  Expiration Date
                </label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="text-xs"
                />
                {errors.expiresAt && (
                  <span className="text-xs text-red-400">{errors.expiresAt}</span>
                )}
              </div>

              {/* Click Limit */}
              <div className="space-y-1">
                <label
                  htmlFor="maxClicks"
                  className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  Click Limit
                </label>
                <Input
                  id="maxClicks"
                  type="number"
                  min="1"
                  placeholder="e.g. 100"
                  value={formData.maxClicks}
                  onChange={handleChange}
                  className="text-xs"
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-1 sm:col-span-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-purple-400" />
                  Password Protection (Optional)
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    mode === "edit"
                      ? "Leave empty to keep current password"
                      : "Enter passcode required before redirect"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  className="text-xs"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1 sm:col-span-2">
                <label
                  htmlFor="tagsString"
                  className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                >
                  <Tag className="h-3.5 w-3.5 text-emerald-400" />
                  Tags (comma separated)
                </label>
                <Input
                  id="tagsString"
                  placeholder="marketing, campaign, github"
                  value={formData.tagsString}
                  onChange={handleChange}
                  className="text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1 sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  Internal Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Internal reminders or context about this link"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <BeatLoader size={8} color="white" />
              ) : mode === "edit" ? (
                "Save Changes"
              ) : (
                "Create Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
