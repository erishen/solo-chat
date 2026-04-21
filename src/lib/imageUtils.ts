const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_DIMENSION = 1024 // 最大宽高（优化性能）
const COMPRESSION_QUALITY = 0.6 // 压缩质量（优化性能）

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

export interface ProcessedImage {
  base64: string
  width: number
  height: number
  size: number
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        let { width, height } = img

        // 如果图片尺寸超过最大限制，进行缩放
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 base64（使用优化后的压缩质量）
        const base64 = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY)
        const base64Data = base64.split(',')[1]

        resolve({
          base64: base64Data,
          width,
          height,
          size: base64Data.length,
        })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export async function processMultipleImages(files: File[]): Promise<ProcessedImage[]> {
  const validationPromises = files.map(async (file) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    return processImage(file)
  })

  return Promise.all(validationPromises)
}

export function getImagePreview(base64: string, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${base64}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
