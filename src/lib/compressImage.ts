import imageCompression from 'browser-image-compression'

const PRESETS = {
  banner:  { maxSizeMB: 0.18, maxWidthOrHeight: 1280 },
  product: { maxSizeMB: 0.15, maxWidthOrHeight: 1024 },
  avatar:  { maxSizeMB: 0.08, maxWidthOrHeight: 400  },
} as const

export async function compressImage(
  file: File,
  type: keyof typeof PRESETS,
): Promise<File> {
  const compressed = await imageCompression(file, {
    ...PRESETS[type],
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  })
  return new File(
    [compressed],
    file.name.replace(/\.[^.]+$/, '.webp'),
    { type: 'image/webp' },
  )
}
