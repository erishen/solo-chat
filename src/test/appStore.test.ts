import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useAppStore } from '@/store/appStore'
import type { Message } from '@/store/appStore'

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      messages: [],
      currentModel: 'gemma4:latest',
      temperature: 0.7,
      ollamaUrl: 'http://localhost:11434',
      isConnected: false,
    })
  })

  it('should have correct initial state', () => {
    const state = useAppStore.getState()
    
    expect(state.messages).toEqual([])
    expect(state.currentModel).toBe('gemma4:latest')
    expect(state.temperature).toBe(0.7)
    expect(state.ollamaUrl).toBe('http://localhost:11434')
    expect(state.isConnected).toBe(false)
  })

  it('should add a message', () => {
    const message: Message = {
      id: '1',
      role: 'user',
      content: 'Test message',
      timestamp: Date.now(),
    }

    act(() => {
      useAppStore.getState().addMessage(message)
    })

    const state = useAppStore.getState()
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0]).toEqual(message)
  })

  it('should update last message', () => {
    const message: Message = {
      id: '1',
      role: 'assistant',
      content: 'Initial content',
      timestamp: Date.now(),
    }

    act(() => {
      useAppStore.getState().addMessage(message)
    })

    act(() => {
      useAppStore.getState().updateLastMessage('Updated content')
    })

    const state = useAppStore.getState()
    expect(state.messages[0].content).toBe('Updated content')
  })

  it('should clear all messages', () => {
    const message1: Message = {
      id: '1',
      role: 'user',
      content: 'Message 1',
      timestamp: Date.now(),
    }
    const message2: Message = {
      id: '2',
      role: 'assistant',
      content: 'Message 2',
      timestamp: Date.now(),
    }

    act(() => {
      useAppStore.getState().addMessage(message1)
      useAppStore.getState().addMessage(message2)
    })

    expect(useAppStore.getState().messages).toHaveLength(2)

    act(() => {
      useAppStore.getState().clearMessages()
    })

    expect(useAppStore.getState().messages).toHaveLength(0)
  })

  it('should set model', () => {
    act(() => {
      useAppStore.getState().setModel('new-model')
    })

    expect(useAppStore.getState().currentModel).toBe('new-model')
  })

  it('should set temperature', () => {
    act(() => {
      useAppStore.getState().setTemperature(1.2)
    })

    expect(useAppStore.getState().temperature).toBe(1.2)
  })

  it('should set ollama url', () => {
    act(() => {
      useAppStore.getState().setOllamaUrl('http://custom-url:11434')
    })

    expect(useAppStore.getState().ollamaUrl).toBe('http://custom-url:11434')
  })

  it('should set connected status', () => {
    act(() => {
      useAppStore.getState().setConnected(true)
    })

    expect(useAppStore.getState().isConnected).toBe(true)
  })
})
