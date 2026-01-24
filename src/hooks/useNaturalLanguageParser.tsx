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

// Validate if a Date object is valid
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Safely create a Date object with validation
function createSafeDate(year: number, month: number, day: number, hours = 0, minutes = 0): Date {
  // Validate input ranges
  if (month < 0 || month > 11) month = 0;
  if (day < 1 || day > 31) day = 1;
  if (hours < 0 || hours > 23) hours = 0;
  if (minutes < 0 || minutes > 59) minutes = 0;

  try {
    const date = new Date(year, month, day, hours, minutes, 0, 0);
    
    // Check if the date is valid
    if (!isValidDate(date)) {
      console.warn('Created invalid date, falling back to today:', { year, month, day, hours, minutes });
      return new Date();
    }
    
    // Check if day overflowed (e.g., Feb 31 becomes March 3)
    if (date.getDate() !== day) {
      // Adjust to the last valid day of the intended month
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      return new Date(year, month, Math.min(day, lastDayOfMonth), hours, minutes, 0, 0);
    }
    
    return date;
  } catch (error) {
    console.warn('Error creating date, falling back to today:', error);
    return new Date();
  }
}

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
      let minutes = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3]?.toLowerCase();

      // Validate parsed values
      if (isNaN(hours) || hours < 0 || hours > 23) hours = 12;
      if (isNaN(minutes) || minutes < 0 || minutes > 59) minutes = 0;

      if (period) {
        if (period.includes('pm') || period.includes('p.m') || period.includes('tarde') || period.includes('noche')) {
          if (hours < 12) hours += 12;
          if (hours > 23) hours = 23;
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
  const today = createSafeDate(now.getFullYear(), now.getMonth(), now.getDate());
  
  try {
    // Check for relative dates
    if (/\bhoy\b/i.test(text)) {
      return today;
    }
    
    if (/\bmañana\b/i.test(text)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return isValidDate(tomorrow) ? tomorrow : today;
    }
    
    if (/\bpasado mañana\b/i.test(text)) {
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return isValidDate(dayAfter) ? dayAfter : today;
    }

    // Check for "próximo/siguiente" + day
    const nextDayMatch = text.match(/(?:el\s+)?(?:próximo|proximo|siguiente|este)\s+(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i);
    if (nextDayMatch) {
      const targetDay = DAYS_ES[nextDayMatch[1].toLowerCase()];
      if (targetDay !== undefined) {
        const result = new Date(today);
        const currentDay = result.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        result.setDate(result.getDate() + daysToAdd);
        return isValidDate(result) ? result : today;
      }
    }

    // Check for day name alone (e.g., "el domingo", "el lunes")
    const dayMatch = text.match(/(?:el\s+)?(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)/i);
    if (dayMatch) {
      const targetDay = DAYS_ES[dayMatch[1].toLowerCase()];
      if (targetDay !== undefined) {
        const result = new Date(today);
        const currentDay = result.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        result.setDate(result.getDate() + daysToAdd);
        return isValidDate(result) ? result : today;
      }
    }

    // Check for specific date patterns
    // "31 de enero", "el 15 de marzo"
    const specificDateMatch = text.match(/(?:el\s+)?(\d{1,2})\s*(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (specificDateMatch) {
      const day = parseInt(specificDateMatch[1], 10);
      const monthName = specificDateMatch[2].toLowerCase();
      const month = MONTHS_ES[monthName];
      
      if (!isNaN(day) && month !== undefined) {
        const year = now.getFullYear();
        const result = createSafeDate(year, month, day);
        
        // If the date is in the past, assume next year
        if (result < today) {
          return createSafeDate(year + 1, month, day);
        }
        return result;
      }
    }

    // Check for "viernes 31" pattern
    const dayNumberMatch = text.match(/(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\s+(\d{1,2})/i);
    if (dayNumberMatch) {
      const day = parseInt(dayNumberMatch[2], 10);
      if (!isNaN(day) && day >= 1 && day <= 31) {
        const result = createSafeDate(today.getFullYear(), today.getMonth(), day);
        if (result < today) {
          return createSafeDate(today.getFullYear(), today.getMonth() + 1, day);
        }
        return result;
      }
    }

    // Default to today
    return today;
  } catch (error) {
    console.warn('Error parsing date, falling back to today:', error);
    return today;
  }
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
  if (title.length === 0) {
    return 'Nueva tarea';
  }
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
      try {
        if (!command || command.trim().length < 3) {
          return null;
        }

        const cleanCommand = command.trim();
        const type = determineType(cleanCommand);
        const title = extractTitle(cleanCommand);
        const date = parseDate(cleanCommand);
        const timeResult = parseTime(cleanCommand);

        // Validate the date before proceeding
        if (!isValidDate(date)) {
          console.warn('Invalid date detected, using today as fallback');
          const fallbackDate = new Date();
          fallbackDate.setHours(0, 0, 0, 0);
          return {
            type,
            title: title || 'Nueva tarea',
            date: fallbackDate,
            time: null,
            description: cleanCommand,
            rawCommand: command,
            confidence: 0.3,
          };
        }

        let time: string | null = null;
        if (timeResult) {
          // Safely set time on the date
          try {
            date.setHours(timeResult.hours, timeResult.minutes, 0, 0);
            
            // Verify date is still valid after setting time
            if (!isValidDate(date)) {
              console.warn('Date became invalid after setting time, resetting time');
              date.setHours(12, 0, 0, 0);
              time = '12:00';
            } else {
              time = `${timeResult.hours.toString().padStart(2, '0')}:${timeResult.minutes.toString().padStart(2, '0')}`;
            }
          } catch (error) {
            console.warn('Error setting time on date:', error);
            time = null;
          }
        }

        // Calculate confidence based on how much info we extracted
        let confidence = 0.5; // Base confidence
        if (title.length > 5) confidence += 0.2;
        if (timeResult) confidence += 0.15;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date.getTime() !== today.getTime()) confidence += 0.15;

        return {
          type,
          title: title || 'Nueva tarea',
          date,
          time,
          description: cleanCommand,
          rawCommand: command,
          confidence: Math.min(confidence, 1),
        };
      } catch (error) {
        console.error('Error parsing command:', error);
        // Return a safe fallback instead of null to prevent crashes
        return {
          type: 'task',
          title: 'Nueva tarea',
          date: new Date(),
          time: null,
          description: command,
          rawCommand: command,
          confidence: 0.2,
        };
      }
    };
  }, []);

  return { parseCommand };
}

export type { ParsedCommand };
