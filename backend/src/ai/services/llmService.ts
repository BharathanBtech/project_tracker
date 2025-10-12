import axios from 'axios';
import db from '../../config/database';
import { 
  LLMProvider, 
  LLMProviderConfig, 
  WorkingHoursConfig,
  BaseAIResponse 
} from '../types';

export class LLMService {
  /**
   * Get the active LLM provider configuration
   */
  static async getActiveProvider(): Promise<{ provider: LLMProvider; config: LLMProviderConfig }> {
    const activeProvider = await db('llm_providers')
      .where({ is_active: true })
      .first();

    if (!activeProvider) {
      throw new Error('No active LLM provider configured. Please configure an LLM provider in Settings.');
    }

    // Get provider configuration
    const configRows = await db('llm_provider_configs')
      .where({ provider_id: activeProvider.id })
      .select('config_key', 'config_value');

    if (!configRows || configRows.length === 0) {
      throw new Error('LLM provider is not configured with an API key. Please add API key in Settings.');
    }

    // Convert config rows to object
    const config: any = {};
    configRows.forEach(row => {
      config[row.config_key] = row.config_value;
    });

    if (!config.api_key) {
      throw new Error('LLM provider is not configured with an API key. Please add API key in Settings.');
    }

    return { provider: activeProvider, config };
  }

  /**
   * Get working hours configuration
   */
  static async getWorkingHoursConfig(): Promise<WorkingHoursConfig | null> {
    return await db('working_hours_config').first();
  }

  /**
   * Calculate working hours per day from configuration
   */
  static calculateWorkingHoursPerDay(workingHoursConfig: WorkingHoursConfig | null): number {
    if (!workingHoursConfig) return 8; // default

    const startTime = new Date(`2000-01-01T${workingHoursConfig.default_start_time}`);
    const endTime = new Date(`2000-01-01T${workingHoursConfig.default_end_time}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    const lunchBreakHours = (workingHoursConfig.lunch_break_minutes || 60) / 60;
    return Math.round(totalHours - lunchBreakHours);
  }

  /**
   * Call OpenAI API
   */
  static async callOpenAI(
    prompt: string, 
    config: LLMProviderConfig
  ): Promise<string> {
    const model = config.model_name || 'gpt-4o-mini';
    const temperature = config.temperature || 0.7;
    const maxTokens = config.max_tokens || 500;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful project management assistant. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Call Gemini API
   */
  static async callGemini(
    prompt: string, 
    config: LLMProviderConfig
  ): Promise<string> {
    const model = config.model_name || 'gemini-pro';
    const temperature = config.temperature || 0.7;
    const maxTokens = config.max_tokens || 500;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.api_key}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * Generic LLM call that routes to the appropriate provider
   */
  static async callLLM(
    prompt: string,
    provider: LLMProvider,
    config: LLMProviderConfig
  ): Promise<string> {
    switch (provider.name.toLowerCase()) {
      case 'openai':
        return this.callOpenAI(prompt, config);
      case 'gemini':
        return this.callGemini(prompt, config);
      case 'copilot':
      case 'cursor':
        return this.callOpenAI(prompt, config); // Both use OpenAI-compatible API
      default:
        throw new Error(`Unsupported LLM provider: ${provider.name}`);
    }
  }

  /**
   * Parse JSON response from LLM
   */
  static parseJSONResponse(content: string): any {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Create standardized AI response
   */
  static createResponse<T>(
    data: T,
    provider: LLMProvider,
    error?: string
  ): BaseAIResponse & { data?: T } {
    return {
      success: !error,
      error,
      provider: provider.display_name,
      timestamp: new Date().toISOString(),
      data: !error ? data : undefined,
    };
  }
}
