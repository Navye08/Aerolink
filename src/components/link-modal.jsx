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
import {createLink, updateLink} from "@/services/linkService";
import {validateUrl, validateAlias, validateExpiration} from "@/lib/validators";
import {BeatLoader} from "react-spinners";
import {
  Lock,
  Calendar,
  Tag,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Link2,
  Sparkles,
} from "lucide-react";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [removePassword, setRemovePassword] = useState(false);

  // Synchronize initial data when opening for Edit or Duplicate
  useEffect(() => {
    setRemovePassword(false);
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

      // Expand advanced controls if any advanced setting exists
      if (formattedExpiry || initialData.max_clicks || initialData.password_hash) {
        setShowAdvanced(true);
      }
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
      setShowAdvanced(false);
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

  const currentOrigin =
    typeof window !== "undefined" ? window.location.host : "aerolink.in";

  const previewSlug =
    formData.customAlias.trim() ||
    (initialData?.short_url ? initialData.short_url : "short-slug");

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
        let passwordUpdate = {};
        if (removePassword) {
          passwordUpdate = {password: null};
        } else if (formData.password) {
          passwordUpdate = {password: formData.password};
        }

        const updated = await updateLink(initialData.id, {
          title: formData.title || urlRes.normalizedUrl.slice(0, 30),
          original_url: urlRes.normalizedUrl,
          custom_url: formData.customAlias ? formData.customAlias.trim().toLowerCase() : null,
          tags: tagsArray,
          notes: formData.notes,
          is_active: formData.isActive,
          expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
          max_clicks: formData.maxClicks ? parseInt(formData.maxClicks, 10) : null,
          ...passwordUpdate,
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
      <DialogContent className="sm:max-w-lg bg-surface border-border-strong p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Link2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {mode === "edit" ? "Edit Link" : "Create New Link"}
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure destination routing, custom alias, and optional security policies.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {apiError && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg">
              {apiError}
            </div>
          )}

          {/* Destination URL */}
          <div className="space-y-1.5">
            <label
              htmlFor="destinationUrl"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Destination URL</span>
              <span className="text-[11px] text-muted-foreground">Required</span>
            </label>
            <Input
              id="destinationUrl"
              type="text"
              placeholder="https://example.com/very/long/url"
              value={formData.destinationUrl}
              onChange={handleChange}
              className={`h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary ${
                errors.destinationUrl ? "border-rose-500" : ""
              }`}
              autoFocus
            />
            {errors.destinationUrl && (
              <span className="text-[11px] text-rose-400 font-medium block">
                {errors.destinationUrl}
              </span>
            )}
          </div>

          {/* Short Link & Custom Alias Preview */}
          <div className="space-y-1.5">
            <label
              htmlFor="customAlias"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Short Link & Custom Alias</span>
              <span className="text-[11px] text-muted-foreground">Optional</span>
            </label>
            <div className="flex items-center rounded-lg border border-border-subtle bg-surface-elevated overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <span className="px-3 py-2 text-xs text-muted-foreground font-mono bg-surface border-r border-border-subtle select-none">
                {currentOrigin}/
              </span>
              <input
                id="customAlias"
                type="text"
                placeholder="custom-slug"
                value={formData.customAlias}
                onChange={handleChange}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono"
              />
            </div>
            {errors.customAlias ? (
              <span className="text-[11px] text-rose-400 font-medium block">
                {errors.customAlias}
              </span>
            ) : (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Live preview: <span className="text-primary font-mono">{currentOrigin}/{previewSlug}</span>
              </p>
            )}
          </div>

          {/* Title & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-medium text-foreground">
                Title (Optional)
              </label>
              <Input
                id="title"
                placeholder="e.g. Portfolio Link"
                value={formData.title}
                onChange={handleChange}
                className="h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="tagsString"
                className="text-xs font-medium text-foreground flex items-center gap-1"
              >
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span>Tags (comma-separated)</span>
              </label>
              <Input
                id="tagsString"
                placeholder="work, social, repo"
                value={formData.tagsString}
                onChange={handleChange}
                className="h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Collapsible Advanced Governance (Progressive Disclosure) */}
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Security & Lifecycle Controls</span>
                {(formData.expiresAt || formData.maxClicks || formData.password) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="space-y-3.5 pt-3 animate-fade-in">
                {/* Expiration Date & Click Cap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="expiresAt"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <Calendar className="h-3 w-3 text-amber-400" />
                      <span>Expiration Date</span>
                    </label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={handleChange}
                      className="h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary text-muted-foreground"
                    />
                    {errors.expiresAt && (
                      <span className="text-[11px] text-rose-400 block">
                        {errors.expiresAt}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="maxClicks"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <ShieldAlert className="h-3 w-3 text-blue-400" />
                      <span>Click Limit Cap</span>
                    </label>
                    <Input
                      id="maxClicks"
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={formData.maxClicks}
                      onChange={handleChange}
                      className="h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Password Protection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-xs font-medium text-foreground flex items-center gap-1.5"
                    >
                      <Lock className="h-3 w-3 text-violet-400" />
                      <span>Passcode Protection</span>
                    </label>
                    {mode === "edit" && initialData?.password_hash && (
                      <label className="flex items-center gap-1.5 text-xs text-rose-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={removePassword}
                          onChange={(e) => setRemovePassword(e.target.checked)}
                          className="rounded border-border-subtle text-rose-500 focus:ring-rose-500 h-3 w-3"
                        />
                        <span>Remove Passcode</span>
                      </label>
                    )}
                  </div>
                  {!removePassword ? (
                    <Input
                      id="password"
                      type="password"
                      placeholder={
                        mode === "edit"
                          ? (initialData?.password_hash ? "Enter new passcode to replace existing" : "Leave blank to keep unencrypted")
                          : "Passcode required to proceed"
                      }
                      value={formData.password}
                      onChange={handleChange}
                      className="h-9 text-xs bg-surface-elevated border-border-subtle focus-visible:ring-primary"
                    />
                  ) : (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                      Passcode protection will be removed when you save changes.
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Verified securely via PostgreSQL RPC; hash is never exposed to visitors.
                  </p>
                </div>

                {/* Internal Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-medium text-foreground">
                    Internal Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Private memo or campaign tracking notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full text-xs rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs border-border-subtle hover:bg-surface-elevated"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/25 px-4"
              disabled={loading}
            >
              {loading ? (
                <BeatLoader size={6} color="white" />
              ) : mode === "edit" ? (
                "Save changes"
              ) : (
                "Create link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
