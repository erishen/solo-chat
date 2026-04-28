import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Image as ImageIcon, Trash2, Settings, Loader2, BarChart3 } from 'lucide-react';
import { useAppStore, type Message } from '@/store/appStore';
import MessageBubble from '@/components/MessageBubble';
import { validateImageFile, processImage } from '@/lib/imageUtils';

export default function Chat() {
  const store = useAppStore();
  
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [store.messages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);
    setIsProcessingImages(true);

    try {
      const processedImages = await Promise.all(
        files.map(async (file) => {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            throw new Error(validation.error || 'Invalid file');
          }
          const processed = await processImage(file);
          return processed.base64;
        })
      );

      setSelectedImages((prev) => [...prev, ...processedImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && selectedImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      timestamp: Date.now(),
    };

    store.addMessage(userMessage);
    setInputText('');
    setSelectedImages([]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    store.addMessage(assistantMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: store.messages
            .concat(userMessage)
            .map((m) => ({
              role: m.role,
              content: m.content,
              images: m.images,
            })),
          model: store.currentModel,
          options: {
            temperature: store.temperature,
          },
          ollamaUrl: store.ollamaUrl,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              fullResponse += parsed.content;
              store.updateLastMessage(fullResponse);
            } catch {
              // Ignore malformed JSON data
            }
          }
        }
      }
    } catch {
      store.updateLastMessage('Sorry, I encountered an error. Please check your Ollama connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">SC</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Solo Chat</h1>
            <p className="text-xs text-zinc-400">{store.currentModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/invest"
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Invest Assistant"
          >
            <BarChart3 size={20} />
          </Link>
          {store.messages.length > 0 && (
            <button
              onClick={store.clearMessages}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 size={20} />
            </button>
          )}
          <Link
            to="/settings"
            className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {store.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-600/20 to-emerald-600/20 rounded-3xl flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SC</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Solo Chat</h2>
              <p className="text-zinc-400">Send a message or upload an image to get started</p>
            </div>
          </div>
        )}
        {store.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        {uploadError && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{uploadError}</p>
          </div>
        )}
        {selectedImages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0">
                <img
                  src={`data:image/jpeg;base64,${img}`}
                  alt={`Selected ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3 bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl transition-colors ${
              isProcessingImages 
                ? 'text-violet-400 bg-zinc-800' 
                : 'text-zinc-400 hover:text-violet-400 hover:bg-zinc-800'
            }`}
            disabled={isLoading || isProcessingImages}
          >
            {isProcessingImages ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <ImageIcon size={24} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={isProcessingImages}
          />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 resize-none max-h-40 focus:outline-none text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && selectedImages.length === 0) || isLoading}
            className="p-2 bg-gradient-to-r from-violet-600 to-emerald-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-violet-500/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
