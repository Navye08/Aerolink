// Backward-compatible adapter delegating to modern linkService
import {
  getLinks,
  getLinkById,
  resolveLinkByAlias,
  createLink,
  deleteLink,
  updateLink,
  toggleLinkStatus,
  verifyLinkPassword,
} from "@/services/linkService";

export {
  getLinks,
  getLinkById,
  resolveLinkByAlias,
  createLink,
  deleteLink,
  updateLink,
  toggleLinkStatus,
  verifyLinkPassword,
};

// Legacy function aliases
export async function getUrls(userId) {
  return getLinks(userId);
}

export async function getUrl({id, user_id}) {
  return getLinkById({id, userId: user_id});
}

export async function getLongUrl(id) {
  return resolveLinkByAlias(id);
}

export async function createUrl({title, longUrl, customUrl, user_id, ...rest}) {
  return createLink({
    title,
    destinationUrl: longUrl,
    customAlias: customUrl,
    userId: user_id,
    ...rest,
  });
}

export async function deleteUrl(id) {
  return deleteLink(id);
}
