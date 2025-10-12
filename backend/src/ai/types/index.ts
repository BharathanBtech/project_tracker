// Shared AI types and interfaces

export interface BaseAIResponse {
  success: boolean;
  error?: string;
  provider: string;
  timestamp: string;
}

export interface WorkingHoursConfig {
  default_start_time: string;
  default_end_time: string;
  lunch_break_minutes: number;
  include_weekends: boolean;
  timezone?: any;
}

export interface LLMProviderConfig {
  api_key: string;
  model_name?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LLMProvider {
  id: number;
  name: string;
  display_name: string;
  description: string;
  config_schema: any;
  is_active: boolean;
  is_default: boolean;
}

// Task-specific types
export interface TaskSuggestionRequest {
  title: string;
  description?: string;
}

export interface TaskSuggestions {
  priority: 'low' | 'medium' | 'high';
  complexity: number; // 1-5
  due_date: string; // ISO date string
  estimated_hours: number;
  reasoning?: string;
}

export interface TaskSuggestionResponse extends BaseAIResponse {
  suggestions: TaskSuggestions;
}

// Future AI feature types can be added here
// Project Analysis types
export interface ProjectAnalysisRequest {
  project_id: number;
  analysis_type: 'risk' | 'timeline' | 'resource' | 'performance';
}

export interface ProjectAnalysisResponse extends BaseAIResponse {
  analysis: any; // Will be more specific based on analysis type
}

// Resource Planning types
export interface ResourcePlanningRequest {
  project_id: number;
  timeline_days: number;
}

export interface ResourcePlanningResponse extends BaseAIResponse {
  recommendations: any; // Will be more specific
}

// Risk Assessment types
export interface RiskAssessmentRequest {
  project_id: number;
  risk_factors?: string[];
}

export interface RiskAssessmentResponse extends BaseAIResponse {
  risks: any; // Will be more specific
}
