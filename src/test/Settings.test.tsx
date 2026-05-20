import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import Settings from '@/pages/Settings'
import { useAppStore } from '@/store/appStore'

vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn(),
}))

global.fetch = vi.fn()

describe('Settings Page', () => {
  const mockStore = {
    ollamaUrl: 'http://localhost:11434',
    isConnected: true,
    currentModel: 'gemma4:latest',
    temperature: 0.7,
    setOllamaUrl: vi.fn(),
    setConnected: vi.fn(),
    setModel: vi.fn(),
    setTemperature: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStore as unknown as typeof mockStore)
    vi.clearAllMocks()
  })

  it('should render settings page', () => {
    render(<Settings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Configure your Ollama connection')).toBeInTheDocument()
  })

  it('should display connection status', () => {
    render(<Settings />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('should display disconnected status', () => {
    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      isConnected: false,
    } as unknown as typeof mockStore)

    render(<Settings />)

    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('should show ollama url input', () => {
    render(<Settings />)

    const input = screen.getByPlaceholderText('http://localhost:11434')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('http://localhost:11434')
  })

  it('should update ollama url when typing', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    const input = screen.getByPlaceholderText('http://localhost:11434')
    await user.clear(input)
    await user.type(input, 'http://custom:11434')

    expect(input).toHaveValue('http://custom:11434')
  })

  it('should have connect button', () => {
    render(<Settings />)

    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })

  it('should have back link', () => {
    render(<Settings />)

    const backLink = screen.getByRole('link')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('should test connection on connect click', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ connected: true, models: ['gemma4:latest'] }),
    } as Response)

    render(<Settings />)

    const input = screen.getByPlaceholderText('http://localhost:11434')
    await user.clear(input)
    await user.type(input, 'http://new:11434')

    const connectButton = screen.getByRole('button', { name: /connect/i })
    await user.click(connectButton)

    await waitFor(() => {
      expect(mockStore.setOllamaUrl).toHaveBeenCalled()
    })
  })

  it('should show testing state while connecting', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockImplementation(() =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({ ok: true, json: async () => ({ connected: true, models: [] }) } as Response),
          100
        )
      )
    )

    render(<Settings />)

    const connectButton = screen.getByRole('button', { name: /connect/i })
    await user.click(connectButton)

    expect(screen.getByText('Testing...')).toBeInTheDocument()
  })

  it('should handle connection error', async () => {
    const user = userEvent.setup()

    vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection failed'))

    render(<Settings />)

    const connectButton = screen.getByRole('button', { name: /connect/i })
    await user.click(connectButton)

    await waitFor(() => {
      expect(mockStore.setConnected).toHaveBeenCalledWith(false)
    })
  })
})
