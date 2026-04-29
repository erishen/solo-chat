import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Brain,
  Database,
  RefreshCw,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { getPortfolioAnalysis, getSignals, getMarketTiming } from '@/services/investApi';

interface Signal {
  code: string;
  name: string;
  signal_type: string;
  strength: string;
  score: number;
  price: number;
  change_percent: number;
  date: string;
}

interface PortfolioData {
  success: boolean;
  summary?: string;
  risk_assessment?: string;
  suggestions?: string[];
  warnings?: string[];
  score?: number;
}

interface TimingData {
  success: boolean;
  state?: string;
  score?: number;
  position_advice?: string;
  indicators?: Record<string, { value: number; signal: string }>;
}

export default function Invest() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [timing, setTiming] = useState<TimingData | null>(null);
  const [loading, setLoading] = useState({
    portfolio: false,
    signals: false,
    timing: false,
  });

  const loadPortfolio = async () => {
    setLoading((prev) => ({ ...prev, portfolio: true }));
    try {
      const data = await getPortfolioAnalysis();
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading((prev) => ({ ...prev, portfolio: false }));
    }
  };

  const loadSignals = async () => {
    setLoading((prev) => ({ ...prev, signals: true }));
    try {
      const data = await getSignals({ min_score: 50, limit: 10 });
      if (data.success && data.signals) {
        setSignals(data.signals);
      }
    } catch (error) {
      console.error('Failed to load signals:', error);
    } finally {
      setLoading((prev) => ({ ...prev, signals: false }));
    }
  };

  const loadTiming = async () => {
    setLoading((prev) => ({ ...prev, timing: true }));
    try {
      const data = await getMarketTiming();
      setTiming(data);
    } catch (error) {
      console.error('Failed to load timing:', error);
    } finally {
      setLoading((prev) => ({ ...prev, timing: false }));
    }
  };

  useEffect(() => {
    loadPortfolio();
    loadSignals();
    loadTiming();
  }, []);

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'bullish':
        return 'text-emerald-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStateText = (state?: string) => {
    switch (state) {
      case 'bullish':
        return '牛市';
      case 'bearish':
        return '熊市';
      default:
        return '震荡';
    }
  };

  const getSignalColor = (type: string) => {
    if (type.includes('金叉') || type.includes('上升')) {
      return 'text-emerald-400';
    }
    if (type.includes('死叉') || type.includes('下降')) {
      return 'text-red-400';
    }
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">投资助手</h1>
            <p className="text-xs text-zinc-400">Invest Assistant</p>
          </div>
        </div>
        <Link
          to="/"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="rotate-180" />
        </Link>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain size={18} className="text-violet-400" />
                组合分析
              </h2>
              <button
                onClick={loadPortfolio}
                disabled={loading.portfolio}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw size={16} className={loading.portfolio ? 'animate-spin' : ''} />
              </button>
            </div>
            
            {loading.portfolio ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-violet-400" />
              </div>
            ) : portfolio?.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">评分:</span>
                  <span className={`text-2xl font-bold ${
                    (portfolio.score || 0) >= 80 ? 'text-emerald-400' :
                    (portfolio.score || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {portfolio.score}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{portfolio.summary}</p>
                {portfolio.warnings && portfolio.warnings.length > 0 && (
                  <div className="space-y-1">
                    {portfolio.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        {w}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">无法获取组合数据</p>
            )}
          </div>

          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                大盘择时
              </h2>
              <button
                onClick={loadTiming}
                disabled={loading.timing}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <RefreshCw size={16} className={loading.timing ? 'animate-spin' : ''} />
              </button>
            </div>
            
            {loading.timing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-emerald-400" />
              </div>
            ) : timing?.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${getStateColor(timing.state)}`}>
                    {getStateText(timing.state)}
                  </span>
                  <span className="text-zinc-400">
                    评分: {timing.score}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{timing.position_advice}</p>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">无法获取择时数据</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" />
              技术信号
            </h2>
            <button
              onClick={loadSignals}
              disabled={loading.signals}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} className={loading.signals ? 'animate-spin' : ''} />
            </button>
          </div>
          
          {loading.signals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-400" />
            </div>
          ) : signals.length > 0 ? (
            <div className="space-y-2">
              {signals.map((signal, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{signal.name}</span>
                    <span className="text-zinc-500 text-sm ml-2">{signal.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${getSignalColor(signal.signal_type)}`}>
                      {signal.signal_type}
                    </span>
                    <span className={`text-sm ${
                      signal.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {signal.change_percent >= 0 ? '+' : ''}{signal.change_percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">暂无信号</p>
          )}
        </div>

        <Link
          to="/chat"
          className="block w-full p-4 bg-gradient-to-r from-violet-600/20 to-emerald-600/20 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">投资问答</h3>
              <p className="text-sm text-zinc-400">AI 投资助手，解答投资问题</p>
            </div>
            <ChevronRight size={20} className="text-zinc-400" />
          </div>
        </Link>

        <Link
          to="/knowledge"
          className="block w-full p-4 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-blue-400" />
              <div>
                <h3 className="font-semibold">知识库</h3>
                <p className="text-sm text-zinc-400">RAG 知识库检索</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-400" />
          </div>
        </Link>
      </div>
    </div>
  );
}
