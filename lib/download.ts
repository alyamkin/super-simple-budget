/**
 * Saves `content` as a file through a temporary `<a download>`.
 * Returns whether the download could start; the object URL is revoked once
 * the click has been handled.
 */
export function downloadFile(name: string, content: string, mime: string): boolean {
  const link = document.createElement("a");
  let url: string | undefined;
  try {
    url = URL.createObjectURL(new Blob([content], { type: mime }));
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    return true;
  } catch {
    return false;
  } finally {
    link.remove();
    if (url !== undefined) {
      const created = url;
      setTimeout(() => URL.revokeObjectURL(created), 0);
    }
  }
}
