export function toEmbedUrl(url: string): string {
  let u = url
    .replace("youtube.com/watch?v=", "youtube.com/embed/")
    .replace("youtube.com/shorts/", "youtube.com/embed/")
    .replace("youtu.be/", "youtube.com/embed/")
    .replace("youtube.com/embed", "youtube-nocookie.com/embed");
  const sep = u.includes("?") ? "&" : "?";
  if (!u.includes("vq=")) u += sep + "vq=hd1080";
  if (!u.includes("iv_load_policy")) u += "&iv_load_policy=3";
  return u;
}

export const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
