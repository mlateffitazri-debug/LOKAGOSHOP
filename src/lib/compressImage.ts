import imageCompression from 'browser-image-compression'

const PRESETS = {
  banner:       { maxSizeMB: 0.18, maxWidthOrHeight: 1280, initialQuality: 0.80 },
  product:      { maxSizeMB: 0.15, maxWidthOrHeight: 1024, initialQuality: 0.80 },
  avatar:       { maxSizeMB: 0.08, maxWidthOrHeight: 400,  initialQuality: 0.80 },
  // Higher quality for seller shop profile — displayed as full-width card on Home
  shop_profile: { maxSizeMB: 0.40, maxWidthOrHeight: 1200, initialQuality: 0.85 },
} as const

export async function compressImage(
  file: File,
  type: keyof typeof PRESETS,
): Promise<File> {
  const { initialQuality, ...dims } = PRESETS[type]
  const compressed = await imageCompression(file, {
    ...dims,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality,
  })
  return new File(
    [compressed],
    file.name.replace(/\.[^.]+$/, '.webp'),
    { type: 'image/webp' },
  )
}
