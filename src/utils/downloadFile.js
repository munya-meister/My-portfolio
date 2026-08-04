export async function downloadPublicFile(url, fallbackName) {
  const safeUrl = encodeURI(url);

  try {
    const response = await fetch(safeUrl, { method: "HEAD" });

    if (!response.ok) {
      return false;
    }

    const link = document.createElement("a");
    link.href = safeUrl;
    link.download = fallbackName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch {
    return false;
  }
}
