export function getYouTubeEmbedId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube-nocookie\.com\/embed\/([^?&#]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}
