import { Request, Response } from 'express';
import { TaskSuggestionRequest } from '../../types';
import { TaskSuggestionService } from './taskSuggestionService';

export const getTaskSuggestions = async (req: Request, res: Response) => {
  try {
    const request: TaskSuggestionRequest = req.body;

    if (!request.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const response = await TaskSuggestionService.generateSuggestions(request);
    res.json(response);
  } catch (error: any) {
    console.error('Get task suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI suggestions',
      details: error.message 
    });
  }
};
