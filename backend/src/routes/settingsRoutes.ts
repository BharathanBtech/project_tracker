import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  // LLM Providers
  getLLMProviders,
  createLLMProvider,
  updateLLMProvider,
  toggleLLMProviderStatus,
  getLLMProviderConfigs,
  updateLLMProviderConfigs,
  
  // Working Days
  getWorkingDaysConfig,
  updateWorkingDaysConfig,
  getHolidayOverrides,
  createHolidayOverride,
  deleteHolidayOverride,
  
  // Working Hours
  getWorkingHoursConfig,
  updateWorkingHoursConfig,
  
  // Role Permissions
  getRolePermissionsConfig,
  updateRolePermissionsConfig
} from '../controllers/settingsController';

const router = Router();

// All settings routes require admin or manager access
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// LLM Providers routes
router.get('/llm-providers', getLLMProviders);
router.post('/llm-providers', createLLMProvider);
router.put('/llm-providers/:id', updateLLMProvider);
router.patch('/llm-providers/:id/status', toggleLLMProviderStatus);
router.get('/llm-providers/:providerId/configs', getLLMProviderConfigs);
router.put('/llm-providers/:providerId/configs', updateLLMProviderConfigs);

// Working Days Configuration routes
router.get('/working-days', getWorkingDaysConfig);
router.put('/working-days', updateWorkingDaysConfig);
router.get('/holidays', getHolidayOverrides);
router.post('/holidays', createHolidayOverride);
router.delete('/holidays/:id', deleteHolidayOverride);

// Working Hours Configuration routes
router.get('/working-hours', getWorkingHoursConfig);
router.put('/working-hours', updateWorkingHoursConfig);

// Role Permissions Configuration routes
router.get('/role-permissions', getRolePermissionsConfig);
router.put('/role-permissions', updateRolePermissionsConfig);

export default router;
