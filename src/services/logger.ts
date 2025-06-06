import { supabase } from './supabase';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  userId?: string;
  action: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private static instance: Logger;
  private readonly tableName = 'security_logs';

  private constructor() {
    // Removido: this.initializeTable();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async log(entry: LogEntry) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert({
          level: entry.level,
          message: entry.message,
          timestamp: entry.timestamp.toISOString(),
          user_id: entry.userId,
          action: entry.action,
          details: entry.details,
          ip: entry.ip,
          user_agent: entry.userAgent
        });

      if (error) {
        console.error('Failed to write log:', error);
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log(`[${entry.level}] ${entry.message}`, entry);
      }
    } catch (error) {
      console.error('Error in logger:', error);
    }
  }

  public async debug(message: string, action: string, details?: Record<string, any>) {
    await this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      action,
      details
    });
  }

  public async info(message: string, action: string, details?: Record<string, any>) {
    await this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      action,
      details
    });
  }

  public async warn(message: string, action: string, details?: Record<string, any>) {
    await this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      action,
      details
    });
  }

  public async error(message: string, action: string, details?: Record<string, any>) {
    await this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      action,
      details
    });
  }

  public async security(
    message: string,
    action: string,
    userId?: string,
    details?: Record<string, any>,
    ip?: string,
    userAgent?: string
  ) {
    await this.log({
      level: LogLevel.SECURITY,
      message,
      timestamp: new Date(),
      userId,
      action,
      details,
      ip,
      userAgent
    });
  }

  public async getRecentLogs(limit: number = 100) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }

    return data;
  }

  public async getLogsByLevel(level: LogLevel, limit: number = 100) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('level', level)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }

    return data;
  }

  public async getLogsByUser(userId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }

    return data;
  }
}

export const logger = Logger.getInstance(); 