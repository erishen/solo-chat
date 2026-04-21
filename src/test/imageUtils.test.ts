import { describe, it, expect, vi } from 'vitest'
import { 
  validateImageFile, 
  processImage, 
  processMultipleImages,
  getImagePreview,
  formatFileSize 
} from '@/lib/imageUtils'

// Mock canvas API
class MockCanvasRenderingContext2D {
  fillRect() {}
  drawImage() {}
}

class MockHTMLCanvasElement {
  width = 0
  height = 0
  getContext() {
    return new MockCanvasRenderingContext2D()
  }
  toBlob(callback: (blob: Blob | null) => void) {
    callback(new Blob(['mock image data'], { type: 'image/jpeg' }))
  }
  toDataURL() {
    return 'data:image/jpeg;base64,mockbase64data'
  }
}

// Mock document.createElement for canvas
const originalCreateElement = document.createElement.bind(document)
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'canvas') {
    return new MockHTMLCanvasElement() as unknown as HTMLCanvasElement
  }
  return originalCreateElement(tagName)
})

// Mock Image
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 100
  height = 100
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload()
      }
    }, 0)
  }
}

global.Image = MockImage as unknown as typeof Image

describe('Image Utils', () => {
  describe('validateImageFile', () => {
    it('should validate JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('should validate PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('should validate GIF files', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('should validate WebP files', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid image type')
    })

    it('should reject files larger than 10MB', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImageFile(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size exceeds maximum limit')
    })

    it('should accept files smaller than 10MB', () => {
      const smallFile = new File(['x'.repeat(1024)], 'small.jpg', { 
        type: 'image/jpeg' 
      })
      const result = validateImageFile(smallFile)
      expect(result.valid).toBe(true)
    })
  })

  describe('processImage', () => {
    it('should process a valid image file', async () => {
      const file = new File(['mock image'], 'test.jpg', { type: 'image/jpeg' })
      
      const result = await processImage(file)
      
      expect(result.base64).toBeDefined()
      expect(result.width).toBeLessThanOrEqual(1024)
      expect(result.height).toBeLessThanOrEqual(1024)
      expect(result.size).toBeGreaterThan(0)
    })

    it('should resize large images', async () => {
      const file = new File(['mock large image'], 'large.jpg', { type: 'image/jpeg' })
      
      const result = await processImage(file)
      
      expect(result.width).toBeLessThanOrEqual(1024)
      expect(result.height).toBeLessThanOrEqual(1024)
    })

    it('should handle image load error', async () => {
      const file = new File(['invalid image'], 'invalid.jpg', { type: 'image/jpeg' })
      
      // Mock Image to trigger onerror
      const OriginalImage = global.Image
      class MockImageWithError {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        src = ''
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror()
            }
          }, 0)
        }
      }
      
      global.Image = MockImageWithError as unknown as typeof Image
      
      await expect(processImage(file)).rejects.toThrow('Failed to load image')
      
      global.Image = OriginalImage
    })

    it('should handle file read error', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock FileReader to trigger onerror
      const OriginalFileReader = global.FileReader
      class MockFileReaderWithError {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror()
            }
          }, 0)
        }
      }
      
      global.FileReader = MockFileReaderWithError as unknown as typeof FileReader
      
      await expect(processImage(file)).rejects.toThrow('Failed to read file')
      
      global.FileReader = OriginalFileReader
    })
  })

  describe('processMultipleImages', () => {
    it('should process multiple images in parallel', async () => {
      const files = [
        new File(['image1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['image3'], 'test3.jpg', { type: 'image/jpeg' }),
      ]
      
      const results = await processMultipleImages(files)
      
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.base64).toBeDefined()
        expect(result.width).toBeLessThanOrEqual(1024)
        expect(result.height).toBeLessThanOrEqual(1024)
      })
    })

    it('should throw error for invalid files', async () => {
      const files = [
        new File([''], 'test.txt', { type: 'text/plain' }),
      ]
      
      await expect(processMultipleImages(files)).rejects.toThrow('Invalid image type')
    })
  })

  describe('getImagePreview', () => {
    it('should generate preview URL with default mime type', () => {
      const base64 = 'dGVzdA=='
      const preview = getImagePreview(base64)
      expect(preview).toBe('data:image/jpeg;base64,dGVzdA==')
    })

    it('should generate preview URL with custom mime type', () => {
      const base64 = 'dGVzdA=='
      const preview = getImagePreview(base64, 'image/png')
      expect(preview).toBe('data:image/png;base64,dGVzdA==')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(100)).toBe('100 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048575)).toBe('1024 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })
})
