// This file is deprecated - functionality moved to organized AI structure
// See: /ai/features/task-suggestions/taskSuggestionController.ts

import { Request, Response } from 'express';
import { getTaskSuggestions as newGetTaskSuggestions } from '../ai/features/task-suggestions/taskSuggestionController';

// Re-export for backward compatibility
export const getTaskSuggestions = newGetTaskSuggestions;