/**
 * Utilitários para manipulação de datas no horário brasileiro (UTC-3)
 */

import { format, toZonedTime } from 'date-fns-tz';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';


/**
 * Formata uma data para exibição no formato brasileiro, sempre usando o fuso de São Paulo
 */
export const formatBrazilianDate = (date: Date | string, pattern = "dd/MM/yyyy HH:mm") => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const zoned = toZonedTime(d, BRAZIL_TIMEZONE);
  const formatted = format(zoned, pattern, { timeZone: BRAZIL_TIMEZONE });
  console.log('[formatBrazilianDate]', { original: date, asDate: d, zoned, formatted });
  return formatted;
};

/**
 * Retorna apenas a data no formato brasileiro (DD/MM/YYYY)
 */
export const formatBrazilianDateOnly = (date: Date | string) => {
  const formatted = formatBrazilianDate(date, "dd/MM/yyyy");
  console.log('[formatBrazilianDateOnly]', { original: date, formatted });
  return formatted;
};

/**
 * Retorna apenas a hora no formato brasileiro (HH:mm)
 */
export const formatBrazilianTimeOnly = (date: Date | string) => {
  const formatted = formatBrazilianDate(date, "HH:mm");
  console.log('[formatBrazilianTimeOnly]', { original: date, formatted });
  return formatted;
};

/**
 * Retorna a hora (0-23) no horário brasileiro para cálculos
 */
export const getBrazilianHour = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 0;
  const zoned = toZonedTime(d, BRAZIL_TIMEZONE);
  const hour = zoned.getHours();
  console.log('[getBrazilianHour]', { original: date, asDate: d, zoned, hour });
  return hour;
};

/**
 * Retorna a data e hora atual no horário brasileiro
 */
export const getCurrentBrazilianDateTime = (): Date => {
  const now = new Date();
  const zoned = toZonedTime(now, BRAZIL_TIMEZONE);
  console.log('[getCurrentBrazilianDateTime]', { now, zoned });
  return zoned;
};

/**
 * Retorna o início do dia atual no horário brasileiro
 */
export const getStartOfBrazilianDay = (): Date => {
  const now = getCurrentBrazilianDateTime();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Retorna o fim do dia atual no horário brasileiro
 */
export const getEndOfBrazilianDay = (): Date => {
  const now = getCurrentBrazilianDateTime();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}; 