export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaListResponse {
  models: OllamaModel[];
}

class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data: OllamaListResponse = await response.json();
      return data.models.map((model) => model.name);
    } catch {
      return [];
    }
  }

  async *chatStream(
    request: OllamaChatRequest
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data: OllamaChatResponse = JSON.parse(line);
            if (data.message.content) {
              yield data.message.content;
            }
          } catch {
            // Ignore malformed JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export default OllamaService;
