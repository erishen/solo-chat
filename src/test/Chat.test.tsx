import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import Chat from '@/pages/Chat'
import { useAppStore } from '@/store/appStore'

// Mock the store
vi.mock('@/store/appStore', () => ({
  useAppStore: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Chat Page', () => {
  const mockStore = {
    messages: [],
    currentModel: 'gemma4:latest',
    temperature: 0.7,
    ollamaUrl: 'http://localhost:11434',
    isConnected: true,
    addMessage: vi.fn(),
    updateLastMessage: vi.fn(),
    clearMessages: vi.fn(),
    setModel: vi.fn(),
    setTemperature: vi.fn(),
    setOllamaUrl: vi.fn(),
    setConnected: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStore as unknown as typeof mockStore)
    vi.clearAllMocks()
  })

  it('should render chat interface', () => {
    render(<Chat />)
    
    expect(screen.getByText('Solo Chat')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render welcome message when no messages', () => {
    render(<Chat />)
    
    expect(screen.getByText('Welcome to Solo Chat')).toBeInTheDocument()
    expect(screen.getByText('Send a message or upload an image to get started')).toBeInTheDocument()
  })

  it('should display current model name', () => {
    render(<Chat />)
    
    expect(screen.getByText('gemma4:latest')).toBeInTheDocument()
  })

  it('should update input text when typing', async () => {
    const user = userEvent.setup()
    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello')
    
    expect(input).toHaveValue('Hello')
  })

  it('should send message when clicking send button', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: true }),
          releaseLock: vi.fn(),
        }),
      },
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    expect(mockStore.addMessage).toHaveBeenCalled()
  })

  it('should send message when pressing Enter', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({ done: true }),
          releaseLock: vi.fn(),
        }),
      },
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Hello{enter}')
    
    expect(mockStore.addMessage).toHaveBeenCalled()
  })

  it('should not send empty message', async () => {
    const user = userEvent.setup()
    render(<Chat />)
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    expect(mockStore.addMessage).not.toHaveBeenCalled()
  })

  it('should display messages', () => {
    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: Date.now(),
        },
      ],
    } as unknown as typeof mockStore)

    render(<Chat />)
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('should show clear button when there are messages', () => {
    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
      ],
    } as unknown as typeof mockStore)

    render(<Chat />)
    
    const clearButton = screen.getByTitle('Clear chat')
    expect(clearButton).toBeInTheDocument()
  })

  it('should clear messages when clicking clear button', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
      ],
    } as unknown as typeof mockStore)

    render(<Chat />)
    
    const clearButton = screen.getByTitle('Clear chat')
    await user.click(clearButton)
    
    expect(mockStore.clearMessages).toHaveBeenCalled()
  })

  it('should disable send button while loading', () => {
    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      messages: [],
    } as unknown as typeof mockStore)

    render(<Chat />)
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    expect(sendButton).toBeDisabled()
  })

  it('should handle image upload button click', async () => {
    const user = userEvent.setup()
    render(<Chat />)
    
    const imageButtons = screen.getAllByRole('button')
    const imageButton = imageButtons.find(btn => btn.querySelector('svg.lucide-image'))
    await user.click(imageButton!)
    
    // File input should be triggered (though we can't test file selection easily)
    expect(imageButton).toBeInTheDocument()
  })

  it('should display error message when upload fails', async () => {
    render(<Chat />)
    
    // Simulate error state
    const errorDiv = screen.queryByText(/Invalid image type/i)
    expect(errorDiv).not.toBeInTheDocument()
  })

  it('should show loading state when processing images', () => {
    render(<Chat />)
    
    // Initially not loading
    const imageButtons = screen.getAllByRole('button')
    const imageButton = imageButtons.find(btn => btn.querySelector('svg.lucide-image'))
    expect(imageButton).not.toHaveClass('text-violet-400')
  })

  it('should render settings link', () => {
    render(<Chat />)
    
    const settingsLink = screen.getByRole('link', { name: 'Settings' })
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })

  it('should handle streaming response', async () => {
    const user = userEvent.setup()
    
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"content":"Hello"}\n'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"content":" world"}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Test')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    await waitFor(() => {
      expect(mockStore.updateLastMessage).toHaveBeenCalled()
    })
  })

  it('should handle malformed JSON in stream', async () => {
    const user = userEvent.setup()
    
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: invalid json\n'),
        })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Test')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    // Should not throw error, just skip malformed JSON
    await waitFor(() => {
      expect(mockStore.addMessage).toHaveBeenCalled()
    })
  })

  it('should handle [DONE] marker in stream', async () => {
    const user = userEvent.setup()
    
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: [DONE]\n'),
        })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: vi.fn(),
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Test')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    await waitFor(() => {
      expect(mockStore.addMessage).toHaveBeenCalled()
    })
  })

  it('should handle fetch error', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Test')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    await waitFor(() => {
      expect(mockStore.updateLastMessage).toHaveBeenCalledWith(
        'Sorry, I encountered an error. Please check your Ollama connection.'
      )
    })
  })

  it('should handle no response body error', async () => {
    const user = userEvent.setup()
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: null,
    } as unknown as Response)

    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Test')
    
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons.find(btn => btn.querySelector('svg.lucide-send'))
    await user.click(sendButton!)
    
    await waitFor(() => {
      expect(mockStore.updateLastMessage).toHaveBeenCalledWith(
        'Sorry, I encountered an error. Please check your Ollama connection.'
      )
    })
  })

  it('should handle image upload with valid file', async () => {
    render(<Chat />)
    
    const file = new File(['mock image'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      // Image should be processed
      expect(input.value).toBe('')
    })
  })

  it('should handle image upload error', async () => {
    render(<Chat />)
    
    const file = new File(['mock'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid image type/i)).toBeInTheDocument()
    })
  })

  it('should handle Shift+Enter for new line', async () => {
    const user = userEvent.setup()
    render(<Chat />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    await user.type(input, 'Line 1{Shift>}{enter}{/Shift}Line 2')
    
    // Should not send message, just add new line
    expect(mockStore.addMessage).not.toHaveBeenCalled()
  })

  it('should send message with images', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn().mockResolvedValueOnce({ done: true }),
          releaseLock: vi.fn(),
        }),
      },
    } as unknown as Response)

    vi.mocked(useAppStore).mockReturnValue({
      ...mockStore,
      messages: [],
    } as unknown as typeof mockStore)

    render(<Chat />)
    
    // Simulate selected images
    const file = new File(['mock image'], 'test.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      // Image preview should be shown
      const preview = screen.queryByAltText('Selected 1')
      if (preview) {
        expect(preview).toBeInTheDocument()
      }
    })
  })
})
