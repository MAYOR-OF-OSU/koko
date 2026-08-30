import "server-only";
import DOMPurify from "isomorphic-dompurify";

/** Sanitise CMS-authored HTML (TipTap output) before rendering on the storefront. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "code"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}
