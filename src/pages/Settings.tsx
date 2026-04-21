import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function Settings() {
  const store = useAppStore();

  const [localOllamaUrl, setLocalOllamaUrl] = useState(store.ollamaUrl);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = useCallback(async (url: string) => {
    setIsTestingConnection(true);
    try {
      const response = await fetch(`/api/ollama/status?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      store.setConnected(data.connected);
      if (data.connected) {
        setAvailableModels(data.models);
      }
    } catch {
      store.setConnected(false);
      setAvailableModels([]);
    } finally {
      setIsTestingConnection(false);
    }
  }, [store]);

  useEffect(() => {
    testConnection(store.ollamaUrl);
  }, [testConnection, store.ollamaUrl]);

  const handleSaveConnection = () => {
    store.setOllamaUrl(localOllamaUrl);
    testConnection(localOllamaUrl);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <SettingsIcon size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-xs text-zinc-400">Configure your Ollama connection</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Ollama Connection</h2>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    store.isConnected ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-zinc-400">
                  {store.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Ollama URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={localOllamaUrl}
                    onChange={(e) => setLocalOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSaveConnection}
                    disabled={isTestingConnection}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-emerald-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all font-medium"
                  >
                    {isTestingConnection ? 'Testing...' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4">Model Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Model
                </label>
                {availableModels.length > 0 ? (
                  <select
                    value={store.currentModel}
                    onChange={(e) => store.setModel(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3">
                    <XCircle size={16} />
                    <span>Connect to Ollama to see available models</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Temperature
                  </label>
                  <span className="text-sm text-violet-400 font-mono">
                    {store.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={store.temperature}
                  onChange={(e) => store.setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600/10 to-emerald-600/10 rounded-2xl p-6 border border-violet-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">Tip</h3>
                <p className="text-zinc-400 text-sm">
                  Make sure Ollama is running locally and you have pulled the Gemma4 model using <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-violet-400">ollama pull gemma4</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
