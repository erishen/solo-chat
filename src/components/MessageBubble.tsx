import { Message } from '@/store/appStore';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-zinc-900/50' : 'bg-transparent'} rounded-2xl`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-violet-600 text-white' : 'bg-emerald-600 text-white'}`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm text-zinc-200">{isUser ? 'You' : 'Solo Chat'}</span>
          <span className="text-xs text-zinc-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={`data:image/jpeg;base64,${img}`}
                alt={`Uploaded image ${idx + 1}`}
                className="max-w-xs max-h-48 rounded-lg object-cover border border-zinc-700"
              />
            ))}
          </div>
        )}
        <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content || <span className="text-zinc-500 animate-pulse">...</span>}
        </div>
      </div>
    </div>
  );
}
