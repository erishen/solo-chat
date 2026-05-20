import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '@/hooks/useTheme'

describe('useTheme Hook', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    document.documentElement.classList.remove('light', 'dark')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    window.matchMedia = originalMatchMedia
  })

  it('should return default theme as light when no saved theme', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('should return saved theme from localStorage', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('dark')

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('should toggle theme from light to dark', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('should toggle theme from dark to light', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('dark')

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('should update document class when theme changes', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')

    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('should save theme to localStorage when changed', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')

    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should use system preference when no saved theme', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
  })
})
