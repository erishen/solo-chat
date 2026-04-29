import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Database, ChevronRight, Loader2, FileText, Tag } from 'lucide-react';
import { queryRAG } from '@/services/investApi';

interface RAGResult {
  content: string;
  title?: string;
  source?: string;
  category?: string;
}

export default function Knowledge() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RAGResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const data = await queryRAG({ query, k: 10 });
      setResults(data.results || []);
    } catch (error) {
      console.error('RAG search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const quickQueries = [
    'TypeScript',
    '投资策略',
    '风险管理',
    'Python',
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">知识库</h1>
            <p className="text-xs text-zinc-400">RAG Knowledge Base</p>
          </div>
        </div>
        <Link
          to="/invest"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="rotate-180" />
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800 mb-4">
          <Search size={20} className="text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="搜索知识库..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : '搜索'}
          </button>
        </div>

        {!searched && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">快速搜索：</p>
            <div className="flex flex-wrap gap-2">
              {quickQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(q);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              找到 {results.length} 个相关结果
            </p>

            {results.length === 0 && !isLoading && (
              <div className="text-center py-12 text-zinc-500">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p>未找到相关内容</p>
              </div>
            )}

            {results.map((result, i) => (
              <div
                key={i}
                className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-zinc-400" />
                      <span className="text-xs text-zinc-400 truncate">
                        {result.source || '未知来源'}
                      </span>
                      {result.category && (
                        <span className="flex items-center gap-1 text-xs text-violet-400">
                          <Tag size={12} />
                          {result.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-200 line-clamp-4">
                      {result.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
