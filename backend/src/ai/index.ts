// AI Module Exports
// This file provides easy access to all AI functionality

// Types
export * from './types';

// Services
export { LLMService } from './services/llmService';

// Feature Services
export { TaskSuggestionService } from './features/task-suggestions/taskSuggestionService';
export { ProjectAnalysisService } from './features/project-analysis/projectAnalysisService';
export { ResourcePlanningService } from './features/resource-planning/resourcePlanningService';
export { RiskAssessmentService } from './features/risk-assessment/riskAssessmentService';
export { PerformanceInsightsService } from './features/performance-insights/performanceInsightsService';

// Controllers
export { getTaskSuggestions } from './features/task-suggestions/taskSuggestionController';

// Routes
export { default as aiRoutes } from './routes/aiRoutes';
