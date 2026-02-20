import { useMemo } from 'react';

interface ParsedCommand {
  type: 'task' | 'event' | 'reminder';
  title: string;
  date: Date;
  time: string | null;
  description: string;
  rawCommand: string;
  confidence: number;
}

// Spanish day names
const DAYS_ES: Record<string, number> = {
  'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
  'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6,
};

// Spanish month names
const MONTHS_ES: Record<string, number> = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
  'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
};

// Parse time from Spanish text
function parseTime(text: string): { hours: number; minutes: number } | null {
  // Match patterns like "4pm", "4 pm", "16:00", "4 de la tarde", "10am", "10 de la mañana"
  const patterns = [
    // 4pm, 4 pm, 4:30pm
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i,
    // 16:00, 16:30
    /(\d{1,2}):(\d{2})/,
    // 4 de la tarde, 10 de la mañana
    /(\d{1,2})\s*(?:de la|en la|por la)\s*(mañana|tarde|noche)/i,
    // a las 4, a las 16
    /a\s*las?\s*(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm|de la mañana|de la tarde|de la noche))?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3]?.toLowerCase();

      if (period) {
        if (period.includes('pm') || period.includes('p.m') || period.includes('tarde') || period.includes('noche')) {
          if (hours < 12) hours += 12;
        } else if (period.includes('am') || period.includes('a.m') || period.includes('mañana')) {
          if (hours === 12) hours = 0;
        }
      }

      return { hours, minutes };
    }
  }

  return null;
}

// Parse date from Spanish text
function parseDate(text: string): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Check for relative dates
  if (/\bhoy\b/i.test(text)) {
    return today;
  }
  
  if (/\bmañana\b/i.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  if (/\bpasado mañana\b/i.test(text)) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter;
  }

  // Check for "próximo/siguiente" + day
  const nextDayMatch = text.match(/(?:el\s+)?(?:próximo|proximo|siguiente|este)\s+(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i);
  if (nextDayMatch) {
    const targetDay = DAYS_ES[nextDayMatch[1].toLowerCase()];
    const result = new Date(today);
    const currentDay = result.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  // Check for day name alone (e.g., "el domingo", "el lunes")
  const dayMatch = text.match(/(?:el\s+)?(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i);
  if (dayMatch) {
    const targetDay = DAYS_ES[dayMatch[1].toLowerCase()];
    const result = new Date(today);
    const currentDay = result.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  // Check for specific date patterns
  // "31 de enero", "el 15 de marzo"
  const specificDateMatch = text.match(/(?:el\s+)?(\d{1,2})\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
  if (specificDateMatch) {
    const day = parseInt(specificDateMatch[1], 10);
    const month = MONTHS_ES[specificDateMatch[2].toLowerCase()];
    const year = now.getFullYear();
    const result = new Date(year, month, day);
    // If the date is in the past, assume next year
    if (result < today) {
      result.setFullYear(year + 1);
    }
    return result;
  }

  // Check for "viernes 31" pattern
  const dayNumberMatch = text.match(/(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+(\d{1,2})/i);
  if (dayNumberMatch) {
    const day = parseInt(dayNumberMatch[2], 10);
    // Find the next occurrence of this day number
    const result = new Date(today);
    result.setDate(day);
    if (result < today) {
      result.setMonth(result.getMonth() + 1);
    }
    return result;
  }

  // Default to today
  return today;
}

// Extract task/event title from command
function extractTitle(text: string): string {
  // Remove common prefixes and date/time references
  let title = text
    .replace(/^(hola\s+flofy[,.]?\s*)/i, '')
    .replace(/^(apunta\s+que\s*)/i, '')
    .replace(/^(recordar(?:me)?\s+)/i, '')
    .replace(/^(evento[:\s]*)/i, '')
    .replace(/^(tarea[:\s]*)/i, '')
    .replace(/^(cita[:\s]*)/i, '')
    .replace(/^(agregar\s+)/i, '')
    .replace(/^(crear\s+)/i, '')
    .replace(/^(añadir\s+)/i, '')
    .trim();

  // Remove date/time references from the end
  title = title
    .replace(/\s+(?:el\s+)?(?:próximo|proximo|siguiente|este)?\s*(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s*.*$/i, '')
    .replace(/\s+(?:hoy|mañana|pasado mañana)\s*.*$/i, '')
    .replace(/\s+(?:el\s+)?\d{1,2}\s*(?:de\s+)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)?\s*.*$/i, '')
    .replace(/\s+a\s+las?\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|de la mañana|de la tarde|de la noche)?.*$/i, '')
    .replace(/\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*.*$/i, '')
    .trim();

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// Determine command type
function determineType(text: string): 'task' | 'event' | 'reminder' {
  const lowerText = text.toLowerCase();
  
  if (/recordar|recuérdame|recuerdame|recordatorio/i.test(lowerText)) {
    return 'reminder';
  }
  
  if (/evento|reunión|reunion|cita|meeting|junta/i.test(lowerText)) {
    return 'event';
  }
  
  return 'task';
}

export function useNaturalLanguageParser() {
  const parseCommand = useMemo(() => {
    return (command: string): ParsedCommand | null => {
      if (!command || command.trim().length < 3) {
        return null;
      }

      const cleanCommand = command.trim();
      const type = determineType(cleanCommand);
      const title = extractTitle(cleanCommand);
      const date = parseDate(cleanCommand);
      const timeResult = parseTime(cleanCommand);

      let time: string | null = null;
      if (timeResult) {
        date.setHours(timeResult.hours, timeResult.minutes, 0, 0);
        time = `${timeResult.hours.toString().padStart(2, '0')}:${timeResult.minutes.toString().padStart(2, '0')}`;
      }

      // Calculate confidence based on how much info we extracted
      let confidence = 0.5; // Base confidence
      if (title.length > 5) confidence += 0.2;
      if (timeResult) confidence += 0.15;
      if (date.getTime() !== new Date().setHours(0, 0, 0, 0)) confidence += 0.15;

      return {
        type,
        title: title || 'Nueva tarea',
        date,
        time,
        description: cleanCommand,
        rawCommand: command,
        confidence: Math.min(confidence, 1),
      };
    };
  }, []);

  return { parseCommand };
}

export type { ParsedCommand };
