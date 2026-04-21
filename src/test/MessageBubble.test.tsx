import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageBubble from '@/components/MessageBubble'
import type { Message } from '@/store/appStore'

describe('MessageBubble', () => {
  const userMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello, this is a test message',
    timestamp: Date.now(),
  }

  const assistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'This is an assistant response',
    timestamp: Date.now(),
  }

  it('renders user message correctly', () => {
    render(<MessageBubble message={userMessage} />)
    
    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('renders assistant message correctly', () => {
    render(<MessageBubble message={assistantMessage} />)
    
    expect(screen.getByText('This is an assistant response')).toBeInTheDocument()
    expect(screen.getByText('Solo Chat')).toBeInTheDocument()
  })

  it('applies correct styling for user message', () => {
    const { container } = render(<MessageBubble message={userMessage} />)
    
    const messageWrapper = container.firstChild
    expect(messageWrapper).toHaveClass('bg-zinc-900/50')
  })

  it('applies correct styling for assistant message', () => {
    const { container } = render(<MessageBubble message={assistantMessage} />)
    
    const messageWrapper = container.firstChild
    expect(messageWrapper).toHaveClass('bg-transparent')
  })

  it('renders message with images', () => {
    const messageWithImages: Message = {
      id: '3',
      role: 'user',
      content: 'Check this image',
      images: ['base64imagedata'],
      timestamp: Date.now(),
    }

    render(<MessageBubble message={messageWithImages} />)
    
    expect(screen.getByText('Check this image')).toBeInTheDocument()
    const image = screen.getByAltText('Uploaded image 1')
    expect(image).toBeInTheDocument()
  })
})
