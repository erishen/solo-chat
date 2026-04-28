import type { ChatRequest, ChatResponse, SignalsRequest, RAGRequest, RAGResponse } from '@/types';

const ASSET_LENS_API = import.meta.env.VITE_ASSET_LENS_API || 'http://localhost:8000';

export async function chatQA(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${ASSET_LENS_API}/api/chat/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`无法连接到 API 服务 (${ASSET_LENS_API})，请确保 asset-lens 服务正在运行`);
    }
    throw error;
  }
}

export async function getPortfolioAnalysis(): Promise<{
  success: boolean;
  summary?: string;
  risk_assessment?: string;
  suggestions?: string[];
  warnings?: string[];
  score?: number;
  error?: string;
}> {
  const response = await fetch(`${ASSET_LENS_API}/api/chat/portfolio`);
  
  if (!response.ok) {
    throw new Error(`Portfolio analysis failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getSignals(request: SignalsRequest): Promise<{
  success: boolean;
  signals?: Array<{
    code: string;
    name: string;
    signal_type: string;
    strength: string;
    score: number;
    price: number;
    change_percent: number;
    date: string;
  }>;
  summary?: string;
  error?: string;
}> {
  const response = await fetch(`${ASSET_LENS_API}/api/chat/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Signals failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getMarketTiming(): Promise<{
  success: boolean;
  state?: string;
  score?: number;
  position_advice?: string;
  indicators?: Record<string, { value: number; signal: string }>;
  error?: string;
}> {
  const response = await fetch(`${ASSET_LENS_API}/api/chat/timing`);
  
  if (!response.ok) {
    throw new Error(`Market timing failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function queryRAG(request: RAGRequest): Promise<RAGResponse> {
  const response = await fetch(`${ASSET_LENS_API}/api/chat/rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`RAG query failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getConfig(): Promise<{
  success: boolean;
  configs?: Record<string, unknown>;
  services?: Record<string, string>;
  error?: string;
}> {
  const response = await fetch(`${ASSET_LENS_API}/api/chat/config`);
  
  if (!response.ok) {
    throw new Error(`Config failed: ${response.statusText}`);
  }
  
  return response.json();
}
