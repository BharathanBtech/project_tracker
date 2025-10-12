# AI Module

This module contains all AI-powered features for the Project Tracker application.

## 📁 Structure

```
ai/
├── types/                    # Shared TypeScript types and interfaces
├── services/                 # Core AI services (LLM integration)
├── utils/                    # Utility functions (validators, helpers)
├── features/                 # Individual AI features
│   ├── task-suggestions/     # Task suggestion AI
│   ├── project-analysis/     # Project analysis AI
│   ├── resource-planning/    # Resource planning AI
│   ├── risk-assessment/      # Risk assessment AI
│   └── performance-insights/ # Performance insights AI
├── routes/                   # AI route definitions
└── index.ts                  # Main exports
```

## 🚀 Features

### ✅ Implemented
- **Task Suggestions**: AI-powered task planning with priority, complexity, due date, and hour estimation

### 🔄 Planned
- **Project Analysis**: Risk, timeline, and performance analysis
- **Resource Planning**: Team allocation and workload optimization
- **Risk Assessment**: Automated risk identification and mitigation strategies
- **Performance Insights**: Team performance analytics and recommendations

## 🔧 Usage

### Adding a New AI Feature

1. **Create Feature Folder**:
   ```bash
   mkdir ai/features/your-feature-name
   ```

2. **Create Service**:
   ```typescript
   // ai/features/your-feature-name/yourFeatureService.ts
   export class YourFeatureService {
     static async processRequest(request: YourFeatureRequest): Promise<YourFeatureResponse> {
       const { provider, config } = await LLMService.getActiveProvider();
       // Your AI logic here
     }
   }
   ```

3. **Create Controller**:
   ```typescript
   // ai/features/your-feature-name/yourFeatureController.ts
   export const yourFeatureEndpoint = async (req: Request, res: Response) => {
     // Handle HTTP request/response
   };
   ```

4. **Add Route**:
   ```typescript
   // ai/routes/aiRoutes.ts
   router.post('/your-feature', yourFeatureEndpoint);
   ```

5. **Add Types**:
   ```typescript
   // ai/types/index.ts
   export interface YourFeatureRequest {
     // Request interface
   }
   export interface YourFeatureResponse extends BaseAIResponse {
     // Response interface
   }
   ```

## 🔌 LLM Integration

The module supports multiple LLM providers:
- **OpenAI** (GPT-4, GPT-4o-mini, etc.)
- **Google Gemini** (Gemini Pro)
- **GitHub Copilot** (OpenAI-compatible)
- **Cursor AI** (OpenAI-compatible)

### Configuration
LLM providers are configured through the Settings UI:
1. Go to Settings → LLM Provider Selection
2. Select provider and enter API key
3. Configure model, temperature, max tokens
4. Set as active provider

## 🛠️ Development

### Testing
```bash
# Test task suggestions
curl -X POST http://localhost:3001/api/ai/task-suggestions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Your task","description":"Task description"}'
```

### Error Handling
All AI features include comprehensive error handling:
- Provider configuration validation
- API key verification
- Response parsing and validation
- Fallback mechanisms

## 📝 Best Practices

1. **Always validate AI responses** using the validators in `utils/validators.ts`
2. **Use the shared LLMService** for consistent provider integration
3. **Include working hours configuration** for time-based calculations
4. **Provide clear error messages** for configuration issues
5. **Test with multiple LLM providers** for compatibility
6. **Document new features** in this README

## 🔮 Future Enhancements

- **Multi-modal AI**: Support for image and document analysis
- **Custom Prompts**: User-configurable AI prompts
- **AI Training**: Fine-tuning on project-specific data
- **Batch Processing**: Process multiple requests efficiently
- **Caching**: Cache AI responses for better performance
- **Analytics**: Track AI usage and effectiveness
