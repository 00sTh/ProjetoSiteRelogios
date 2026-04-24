export function toEmbedUrl(url: string): string {
  if (!url) return url;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  if (url.includes("youtube-nocookie.com/embed")) return url.split("?")[0];
  // Vimeo
  const vm = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export function toBackgroundEmbedUrl(url: string): string {
  if (!url) return url;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) {
    const id = yt[1];
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0`;
  }
  if (url.includes("youtube-nocookie.com/embed")) {
    const id = url.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
    if (id && !url.includes("autoplay=1")) return `${url.split("?")[0]}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0`;
    return url;
  }
  const vm = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return url;
}

export function isVimeo(url: string): boolean {
  return url.includes("vimeo.com");
}

export const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
