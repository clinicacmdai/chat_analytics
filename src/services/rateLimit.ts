import { supabase } from './supabase';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100, // 100 requisições
  windowMs: 60 * 1000, // por minuto
};

class RateLimiter {
  private config: RateLimitConfig;
  private requests: Map<string, number[]>;

  constructor(config: RateLimitConfig = defaultConfig) {
    this.config = config;
    this.requests = new Map();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.config.windowMs
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  async checkLimit(key: string): Promise<boolean> {
    this.cleanup();
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.config.windowMs
    );

    if (validTimestamps.length >= this.config.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}

// Criar uma instância do rate limiter
const rateLimiter = new RateLimiter();

// Middleware para aplicar rate limiting
export const withRateLimit = async (key: string): Promise<boolean> => {
  return await rateLimiter.checkLimit(key);
};

// Função para obter a chave do rate limit baseada no usuário
export const getRateLimitKey = (userId: string, endpoint: string): string => {
  return `${userId}:${endpoint}`;
}; 