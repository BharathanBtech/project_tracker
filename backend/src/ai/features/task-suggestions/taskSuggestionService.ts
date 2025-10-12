import { 
  TaskSuggestionRequest, 
  TaskSuggestions, 
  TaskSuggestionResponse,
  WorkingHoursConfig 
} from '../../types';
import { LLMService } from '../../services/llmService';
import { 
  validatePriority, 
  validateComplexity, 
  validateHours, 
  validateDateWithWorkingHours 
} from '../../utils/validators';

export class TaskSuggestionService {
  /**
   * Generate AI suggestions for task creation
   */
  static async generateSuggestions(request: TaskSuggestionRequest): Promise<TaskSuggestionResponse> {
    try {
      // Get LLM provider and configuration
      const { provider, config } = await LLMService.getActiveProvider();
      
      // Get working hours configuration
      const workingHoursConfig = await LLMService.getWorkingHoursConfig();
      const workingHoursPerDay = LLMService.calculateWorkingHoursPerDay(workingHoursConfig);

      // Generate AI prompt
      const prompt = this.createPrompt(request, workingHoursPerDay);

      // Call LLM
      const response = await LLMService.callLLM(prompt, provider, config);
      
      // Parse and validate response
      const aiResponse = LLMService.parseJSONResponse(response);
      const suggestions = this.validateSuggestions(aiResponse, workingHoursConfig);

      return LLMService.createResponse(suggestions, provider) as TaskSuggestionResponse;
    } catch (error: any) {
      throw new Error(`Failed to generate task suggestions: ${error.message}`);
    }
  }

  /**
   * Create the AI prompt for task suggestions
   */
  private static createPrompt(request: TaskSuggestionRequest, workingHoursPerDay: number): string {
    return `You are a project management assistant. Based on the following task information, provide suggestions for task planning.

Task Title: ${request.title}
Task Description: ${request.description || 'No description provided'}

Working Hours Configuration:
- Working hours per day: ${workingHoursPerDay} hours
- Consider this when calculating due dates based on estimated hours

Please analyze this task and provide:
1. Priority (low, medium, or high)
2. Complexity (1-5 scale, where 1 is simple and 5 is very complex)
3. Due date (calculate based on estimated hours and working hours per day, in YYYY-MM-DD format)
4. Estimated hours (how many hours this task might take)

IMPORTANT: For due date calculation:
- If estimated_hours <= working_hours_per_day, due date should be tomorrow
- If estimated_hours > working_hours_per_day, calculate: Math.ceil(estimated_hours / working_hours_per_day) days from today
- Always ensure due date is in the future

Respond ONLY with a valid JSON object in this exact format:
{
  "priority": "low|medium|high",
  "complexity": 1-5,
  "due_date": "YYYY-MM-DD",
  "estimated_hours": number,
  "reasoning": "brief explanation including due date calculation"
}`;
  }

  /**
   * Validate and sanitize AI suggestions
   */
  private static validateSuggestions(
    aiResponse: any, 
    workingHoursConfig: WorkingHoursConfig | null
  ): TaskSuggestions {
    return {
      priority: validatePriority(aiResponse.priority),
      complexity: validateComplexity(aiResponse.complexity),
      due_date: validateDateWithWorkingHours(
        aiResponse.due_date, 
        aiResponse.estimated_hours, 
        workingHoursConfig
      ),
      estimated_hours: validateHours(aiResponse.estimated_hours),
      reasoning: aiResponse.reasoning || ''
    };
  }
}
