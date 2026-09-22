import {useState} from "react";
import LinkRow from "./link-row";
import LinkCardMobile from "./link-card-mobile";
import QrModal from "./qr-modal";
import ConfirmDialog from "./confirm-dialog";
import LinkModal from "./link-modal";
import {deleteLink, toggleLinkStatus} from "@/services/linkService";

export default function LinkCard({url, fetchUrls, clickCount = 0}) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fullShortUrl = `${
    typeof window !== "undefined" ? window.location.origin : "https://aerolink.in"
  }/${url.custom_url || url.short_url}`;

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

  const commonProps = {
    url,
    clickCount,
    onOpenQr: () => setShowQrModal(true),
    onOpenEdit: () => setShowEditModal(true),
    onOpenDuplicate: () => setShowDuplicateModal(true),
    onOpenDelete: () => setShowDeleteConfirm(true),
    onToggleStatus: handleToggle,
    isToggling,
  };

  return (
    <>
      {/* Desktop Dense Table Row */}
      <LinkRow {...commonProps} />

      {/* Mobile Card View */}
      <LinkCardMobile {...commonProps} />

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
