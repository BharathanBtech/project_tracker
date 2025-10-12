import { WorkingHoursConfig } from '../types';

/**
 * Validation utilities for AI responses
 */

export function validatePriority(priority: string): 'low' | 'medium' | 'high' {
  const normalized = priority?.toLowerCase();
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized as 'low' | 'medium' | 'high';
  }
  return 'medium'; // default
}

export function validateComplexity(complexity: any): number {
  const num = parseInt(complexity);
  if (isNaN(num) || num < 1) return 3;
  if (num > 5) return 5;
  return num;
}

export function validateHours(hours: any): number {
  const num = parseFloat(hours);
  if (isNaN(num) || num < 0) return 8; // default 1 day
  if (num > 1000) return 1000; // cap at 1000 hours
  return Math.round(num * 100) / 100; // round to 2 decimal places
}

export function validateDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (isNaN(date.getTime()) || date < today) {
      // Default to 7 days from now if invalid or in the past
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return defaultDate.toISOString().split('T')[0];
    }
    return dateStr;
  } catch {
    // Default to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return defaultDate.toISOString().split('T')[0];
  }
}

export function validateDateWithWorkingHours(
  dateStr: string, 
  estimatedHours: number, 
  workingHoursConfig?: WorkingHoursConfig | null
): string {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (isNaN(date.getTime()) || date < today) {
      // Calculate proper due date based on working hours
      let workingHoursPerDay = 8; // default
      if (workingHoursConfig) {
        const startTime = new Date(`2000-01-01T${workingHoursConfig.default_start_time}`);
        const endTime = new Date(`2000-01-01T${workingHoursConfig.default_end_time}`);
        const diffMs = endTime.getTime() - startTime.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);
        const lunchBreakHours = (workingHoursConfig.lunch_break_minutes || 60) / 60;
        workingHoursPerDay = Math.round(totalHours - lunchBreakHours); // Subtract lunch break
      }
      
      // Calculate days needed based on working hours
      const daysNeeded = Math.ceil(estimatedHours / workingHoursPerDay);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + daysNeeded);
      return defaultDate.toISOString().split('T')[0];
    }
    return dateStr;
  } catch {
    // Default to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    return defaultDate.toISOString().split('T')[0];
  }
}
