import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Settings, Loader2, BarChart3, Brain, Zap, Sparkles } from 'lucide-react';
import { chatQA } from '@/services/investApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function InvestChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fastMode, setFastMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await chatQA({
        message: inputText,
        use_rag: true,
        fast_mode: fastMode,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，分析过程中出现错误。\n\n${error instanceof Error ? error.message : '请检查 API 服务是否正常运行。'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const clearMessages = () => {
    setMessages([]);
  };

  const quickQuestions = [
    '当前市场趋势如何？',
    '如何控制投资风险？',
    '什么时候应该止损？',
    '如何分散投资？',
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">投资问答</h1>
            <p className="text-xs text-zinc-400">AI 投资助手</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFastMode(!fastMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              fastMode
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                : 'bg-violet-600/20 text-violet-400 border border-violet-600/30'
            }`}
            title={fastMode ? '快速模式（规则引擎）' : 'AI 模式（Ollama）'}
          >
            {fastMode ? <Zap size={14} /> : <Sparkles size={14} />}
            {fastMode ? '快速' : 'AI'}
          </button>
          <Link
            to="/invest"
            className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="投资仪表盘"
          >
            <BarChart3 size={20} />
          </Link>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="清空对话"
            >
              <Trash2 size={20} />
            </button>
          )}
          <Link
            to="/settings"
            className="p-2 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="设置"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-3xl flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">投资问答助手</h2>
              <p className="text-zinc-400 mb-4">基于 AI 和知识库的投资问答</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(q);
                  }}
                  className="p-3 text-left text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl px-4 py-3">
              <Loader2 size={20} className="animate-spin text-emerald-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-end gap-3 bg-zinc-900 rounded-2xl p-3 border border-zinc-800">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入投资问题..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 resize-none max-h-40 focus:outline-none text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
