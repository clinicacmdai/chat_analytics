import { supabase } from './supabase';
import type { Conversation, ChatHistory, ChatMessage, Insight, DashboardStats, Message, Produto } from '../types';
import { getCurrentBrazilianDateTime } from '../utils/dateUtils';
import { withRateLimit, getRateLimitKey } from './rateLimit';
import { logger } from './logger';

export const supabaseService = {
  // Auth
  async signIn(email: string, password: string) {
    const key = getRateLimitKey('auth', 'signIn');
    if (!await withRateLimit(key)) {
      await logger.security(
        'Rate limit exceeded for sign in attempts',
        'AUTH_RATE_LIMIT',
        undefined,
        { email }
      );
      console.log('Rate limit exceeded, security log attempted');
      throw new Error('Too many sign in attempts. Please try again later.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        await logger.error(
          'Failed to sign in',
          'AUTH_SIGN_IN',
          undefined,
          { email, error: error.message }
        );
        console.log('Login failed, error log attempted:', error.message);
        throw error;
      }

      await logger.info(
        'User signed in successfully',
        'AUTH_SIGN_IN',
        data.user?.id,
        { email }
      );
      console.log('Login successful, info log attempted');
      
      return data;
    } catch (error) {
      await logger.error(
        'Unexpected error during sign in',
        'AUTH_SIGN_IN',
        undefined,
        { email, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      console.log('Unexpected error, error log attempted:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await logger.error(
          'Failed to sign out',
          'AUTH_SIGN_OUT',
          undefined,
          { error: error.message }
        );
        throw error;
      }
      await logger.info('User signed out successfully', 'AUTH_SIGN_OUT');
    } catch (error) {
      await logger.error(
        'Unexpected error during sign out',
        'AUTH_SIGN_OUT',
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  },

  // Conversations
  async getConversations(period: string = '7d') {
    const key = getRateLimitKey('conversations', 'getConversations');
    if (!await withRateLimit(key)) {
      await logger.warn(
        'Rate limit exceeded for getConversations',
        'CONVERSATIONS_RATE_LIMIT',
        undefined,
        { period }
      );
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      console.log('Fetching conversations from n8n_chat_histories...');
      const now = getCurrentBrazilianDateTime();
      let startDate: Date;

      // Define o período inicial baseado no filtro selecionado
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .not('created_at', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', data);

      // Group messages by session_id
      const conversationsMap = new Map<string, Conversation>();
      
      (data as ChatHistory[]).forEach((history) => {
        // Map type to role for UI
        const message: ChatMessage = {
          ...history.message,
          role: history.message.type === 'human' ? 'user' : 'assistant',
        };
        if (!conversationsMap.has(history.session_id)) {
          conversationsMap.set(history.session_id, {
            session_id: history.session_id,
            messages: [],
            last_message: message,
            last_message_time: new Date(history.created_at),
          });
        }
        const conversation = conversationsMap.get(history.session_id)!;
        conversation.messages.push(message);
        const messageTime = new Date(history.created_at);
        if (!conversation.last_message_time || messageTime > conversation.last_message_time) {
          conversation.last_message = message;
          conversation.last_message_time = messageTime;
        }
      });
      const conversations = Array.from(conversationsMap.values());
      console.log('Processed conversations:', conversations);

      await logger.info(
        'Conversations fetched successfully',
        'CONVERSATIONS_FETCH',
        undefined,
        { period, count: conversations.length }
      );

      return conversations;
    } catch (error) {
      await logger.error(
        'Failed to fetch conversations',
        'CONVERSATIONS_FETCH',
        undefined,
        { period, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  },

  async getConversation(sessionId: string) {
    const key = getRateLimitKey('conversations', 'getConversation');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    console.log('Fetching conversation for session:', sessionId);
    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', sessionId)
      .not('created_at', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }

    console.log('Raw conversation data:', data);

    // Map type to role for UI
    const messages: ChatMessage[] = (data as ChatHistory[]).map(history => ({
      ...history.message,
      role: history.message.type === 'human' ? 'user' : 'assistant',
    }));
    const created_at_list = (data as ChatHistory[]).map(history => history.created_at);
    const lastMessage = messages[messages.length - 1];
    const lastMessageTime = data.length > 0 ? new Date(data[data.length - 1].created_at) : new Date();

    const conversation = {
      session_id: sessionId,
      messages,
      last_message: lastMessage,
      last_message_time: lastMessageTime,
      created_at_list,
    } as Conversation;

    console.log('Processed conversation:', conversation);
    return conversation;
  },

  // Messages
  async getMessages(conversationId: string) {
    const key = getRateLimitKey('messages', 'getMessages');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    if (error) throw error;
    return data as Message[];
  },

  // Insights
  async getInsights() {
    const key = getRateLimitKey('insights', 'getInsights');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .not('created_at', 'is', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Insight[];
  },

  async createInsight(question: string) {
    // In a real application, this would call an AI service
    const { data, error } = await supabase
      .from('insights')
      .insert([
        {
          question,
          answer: 'Esta é uma resposta simulada. Em produção, esta resposta viria da API de IA.',
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as Insight;
  },

  // Dashboard
  async getDashboardStats(period: string = '7d') {
    const key = getRateLimitKey('dashboard', 'getStats');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    const now = getCurrentBrazilianDateTime();
    let startDate: Date;

    // Define o período inicial baseado no filtro selecionado
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('session_id, id, created_at')
      .not('created_at', 'is', null)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (error) throw error;

    const uniqueSessions = new Set(data.map((item: any) => item.session_id));
    const lastMessageTime = data.length > 0 
      ? new Date(Math.max(...data.map((item: any) => new Date(item.created_at).getTime())))
      : getCurrentBrazilianDateTime();
    
    return {
      total_conversations: data.length,
      unique_sessions: uniqueSessions.size,
      last_conversation_time: lastMessageTime,
    } as DashboardStats;
  },

  async getDDDDistribution(period: string = '7d') {
    const key = getRateLimitKey('dashboard', 'getDDDDistribution');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    const now = getCurrentBrazilianDateTime();
    let startDate: Date;

    // Define o período inicial baseado no filtro selecionado
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .select('session_id')
      .not('created_at', 'is', null)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    if (error) throw error;

    // Extrair DDDs dos números de telefone e contar clientes únicos
    const dddClients: Record<string, Set<string>> = {};
    data.forEach((item: any) => {
      // Extrair DDD do número (formato: 55DDDNÚMERO)
      const match = item.session_id.match(/^55(\d{2})/);
      const ddd = match ? match[1] : 'Desconhecido';
      if (!dddClients[ddd]) dddClients[ddd] = new Set();
      dddClients[ddd].add(item.session_id);
    });

    // Converter para array e ordenar por quantidade de clientes únicos
    return Object.entries(dddClients)
      .map(([ddd, set]) => ({ ddd, count: set.size }))
      .sort((a, b) => b.count - a.count);
  },

  async getContactNameByPhone(phone: string): Promise<string | null> {
    const key = getRateLimitKey('contacts', 'getContactName');
    if (!await withRateLimit(key)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    console.log('[getContactNameByPhone] Consultando nome para telefone:', phone);
    const { data, error } = await supabase
      .from('IA_CLIENTE')
      .select('nome')
      .eq('telefone', phone)
      // .limit(1)
      .maybeSingle();
    if (error) {
      console.error('[getContactNameByPhone] Erro ao buscar nome:', error);
    }
    if (!data) {
      console.warn('[getContactNameByPhone] Nenhum dado retornado para telefone:', phone);
    } else {
      console.log('[getContactNameByPhone] Nome encontrado:', data.nome);
    }
    if (error || !data) return null;
    return data.nome || null;
  },

  // Produtos
  async getProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('descricao', { ascending: true });
    
    if (error) throw error;
    return data as Produto[];
  },

  async getProduto(id: number) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Produto;
  },

  async createProduto(produto: Omit<Produto, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select()
      .single();
    
    if (error) throw error;
    return data as Produto;
  },

  async updateProduto(id: number, produto: Partial<Omit<Produto, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('produtos')
      .update(produto)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Produto;
  },

  async deleteProduto(id: number) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
}; 