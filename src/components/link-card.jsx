import {useState} from "react";
import {Link} from "react-router-dom";
import {Button} from "./ui/button";
import {
  Copy,
  ExternalLink,
  QrCode,
  Edit2,
  Trash2,
  Lock,
  Calendar,
  Check,
  Power,
  CopyPlus,
} from "lucide-react";
import QrModal from "./qr-modal";
import ConfirmDialog from "./confirm-dialog";
import LinkModal from "./link-modal";
import {deleteLink, toggleLinkStatus} from "@/services/linkService";
import {getLinkStatus} from "@/lib/validators";

export default function LinkCard({url, fetchUrls, clickCount = 0}) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fullShortUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://aerolink.in"
  }/${url.custom_url || url.short_url}`;

  const statusInfo = getLinkStatus(url, clickCount);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await toggleLinkStatus(url.id, url.is_active);
      if (fetchUrls) fetchUrls();
    } catch (err) {
      console.error("Failed to toggle link status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteLink(url.id);
      setShowDeleteConfirm(false);
      if (fetchUrls) fetchUrls();
    } catch (err) {
      console.error("Failed to delete link:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all flex flex-col md:flex-row gap-5 items-start justify-between">
        {/* Left Side: QR Preview Thumbnail & Details */}
        <div className="flex gap-4 items-start w-full md:w-auto flex-1 min-w-0">
          {/* Clickable QR Thumbnail */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            title="Click to expand QR Code Studio"
            className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 border border-gray-700 rounded-lg p-2 flex-shrink-0 hover:border-blue-500 transition-colors flex flex-col items-center justify-center group"
          >
            <QrCode className="h-8 w-8 text-gray-300 group-hover:text-blue-400 transition-colors" />
            <span className="text-[10px] text-gray-400 group-hover:text-blue-400 mt-1 font-medium">
              QR Studio
            </span>
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Header: Title + Status Badge */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                to={`/link/${url.id}`}
                className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition-colors truncate max-w-sm"
              >
                {url.title}
              </Link>

              {/* Status Badge */}
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  statusInfo.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : statusInfo.status === "disabled"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : statusInfo.status === "limit_reached"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-gray-700 text-gray-400 border-gray-600"
                }`}
              >
                {statusInfo.label}
              </span>

              {/* Password Protection Badge */}
              {url.password_hash && (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  title="Password Protected Link"
                >
                  <Lock className="h-3 w-3" />
                  Protected
                </span>
              )}
            </div>

            {/* Short URL with Copy button */}
            <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold mb-1">
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-xs sm:max-w-md"
              >
                {fullShortUrl}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy short link"
                className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Destination URL */}
            <a
              href={url.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 truncate max-w-sm sm:max-w-lg mb-2"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{url.original_url}</span>
            </a>

            {/* Metadata & Tag Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
              <span>{new Date(url.created_at).toLocaleDateString()}</span>

              {url.expires_at && (
                <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                  <Calendar className="h-3 w-3" />
                  Expires {new Date(url.expires_at).toLocaleDateString()}
                </span>
              )}

              {Array.isArray(url.tags) &&
                url.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] border border-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Right Side: Action Toolbar */}
        <div className="flex items-center gap-1 self-end md:self-center">
          {/* Toggle Active Switch */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={isToggling}
            title={url.is_active ? "Disable link" : "Enable link"}
            className={
              url.is_active
                ? "text-emerald-400 hover:text-amber-400"
                : "text-amber-400 hover:text-emerald-400"
            }
          >
            <Power className="h-4 w-4" />
          </Button>

          {/* QR Studio Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowQrModal(true)}
            title="QR Code Studio"
          >
            <QrCode className="h-4 w-4" />
          </Button>

          {/* Edit Link Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEditModal(true)}
            title="Edit link details"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          {/* Duplicate Link Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowDuplicateModal(true)}
            title="Duplicate link"
          >
            <CopyPlus className="h-4 w-4" />
          </Button>

          {/* Delete Link Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            title="Delete link"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showQrModal && (
        <QrModal
          isOpen={showQrModal}
          onOpenChange={setShowQrModal}
          url={fullShortUrl}
          title={url.title}
        />
      )}

      {showEditModal && (
        <LinkModal
          isOpen={showEditModal}
          onOpenChange={setShowEditModal}
          mode="edit"
          initialData={url}
          userId={url.user_id}
          onSuccess={fetchUrls}
        />
      )}

      {showDuplicateModal && (
        <LinkModal
          isOpen={showDuplicateModal}
          onOpenChange={setShowDuplicateModal}
          mode="create"
          initialData={{
            title: `${url.title} (Copy)`,
            destinationUrl: url.original_url,
            tags: url.tags,
            notes: url.notes,
          }}
          userId={url.user_id}
          onSuccess={fetchUrls}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Short Link?"
        description={`Are you sure you want to delete "${url.title}"? All analytics and redirection for ${fullShortUrl} will permanently stop.`}
        confirmText="Delete Link"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
