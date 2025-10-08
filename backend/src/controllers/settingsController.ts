import { Request, Response } from 'express';
import db from '../config/database';

// LLM Providers
export const getLLMProviders = async (req: Request, res: Response) => {
  try {
    const providers = await db('llm_providers').select('*').orderBy('display_name');
    res.json({ providers });
  } catch (error) {
    console.error('Get LLM providers error:', error);
    res.status(500).json({ error: 'Failed to fetch LLM providers' });
  }
};

export const createLLMProvider = async (req: Request, res: Response) => {
  try {
    const { name, display_name, description, config_schema } = req.body;
    
    const [provider] = await db('llm_providers')
      .insert({
        name,
        display_name,
        description,
        config_schema: config_schema ? JSON.stringify(config_schema) : null,
        is_active: true,
        is_default: false
      })
      .returning('*');

    res.status(201).json({ provider });
  } catch (error) {
    console.error('Create LLM provider error:', error);
    res.status(500).json({ error: 'Failed to create LLM provider' });
  }
};

export const updateLLMProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { display_name, description, config_schema, is_active, is_default } = req.body;
    
    // If setting this provider as active, deactivate all others
    if (is_active) {
      await db('llm_providers').update({ is_active: false });
    }

    // If setting this provider as default, unset all other defaults
    if (is_default) {
      await db('llm_providers').update({ is_default: false });
    }
    
    const [provider] = await db('llm_providers')
      .where({ id })
      .update({
        display_name,
        description,
        config_schema: config_schema ? JSON.stringify(config_schema) : null,
        is_active,
        is_default
      })
      .returning('*');

    if (!provider) {
      return res.status(404).json({ error: 'LLM provider not found' });
    }

    res.json({ provider });
  } catch (error) {
    console.error('Update LLM provider error:', error);
    res.status(500).json({ error: 'Failed to update LLM provider' });
  }
};

export const getLLMProviderConfigs = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    
    const configs = await db('llm_provider_configs')
      .where({ provider_id: providerId })
      .select('*');

    res.json({ configs });
  } catch (error) {
    console.error('Get LLM provider configs error:', error);
    res.status(500).json({ error: 'Failed to fetch LLM provider configurations' });
  }
};

export const toggleLLMProviderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // If activating this provider, deactivate all others first
    if (is_active) {
      await db('llm_providers').update({ is_active: false });
    }

    const [provider] = await db('llm_providers')
      .where({ id })
      .update({ is_active })
      .returning('*');

    if (!provider) {
      return res.status(404).json({ error: 'LLM provider not found' });
    }

    res.json({ provider });
  } catch (error) {
    console.error('Toggle LLM provider status error:', error);
    res.status(500).json({ error: 'Failed to toggle LLM provider status' });
  }
};

export const updateLLMProviderConfigs = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const { configs } = req.body;

    // Delete existing configs
    await db('llm_provider_configs').where({ provider_id: providerId }).del();

    // Insert new configs
    if (configs && configs.length > 0) {
      const configData = configs.map((config: any) => ({
        provider_id: providerId,
        config_key: config.config_key,
        config_value: config.config_value,
        is_encrypted: config.is_encrypted || true
      }));

      await db('llm_provider_configs').insert(configData);
    }

    // Fetch updated configs
    const updatedConfigs = await db('llm_provider_configs')
      .where({ provider_id: providerId })
      .select('*');

    res.json({ configs: updatedConfigs });
  } catch (error) {
    console.error('Update LLM provider configs error:', error);
    res.status(500).json({ error: 'Failed to update LLM provider configurations' });
  }
};

// Working Days Configuration
export const getWorkingDaysConfig = async (req: Request, res: Response) => {
  try {
    const configs = await db('working_days_config').select('*').orderBy('day_of_week');
    res.json({ configs });
  } catch (error) {
    console.error('Get working days config error:', error);
    res.status(500).json({ error: 'Failed to fetch working days configuration' });
  }
};

export const updateWorkingDaysConfig = async (req: Request, res: Response) => {
  try {
    const { configs } = req.body;

    // Update each day configuration
    for (const config of configs) {
      await db('working_days_config')
        .where({ day_of_week: config.day_of_week })
        .update({
          is_working_day: config.is_working_day,
          start_time: config.start_time,
          end_time: config.end_time,
          notes: config.notes
        });
    }

    // Fetch updated configs
    const updatedConfigs = await db('working_days_config').select('*').orderBy('day_of_week');
    res.json({ configs: updatedConfigs });
  } catch (error) {
    console.error('Update working days config error:', error);
    res.status(500).json({ error: 'Failed to update working days configuration' });
  }
};

export const getHolidayOverrides = async (req: Request, res: Response) => {
  try {
    const holidays = await db('holiday_overrides').select('*').orderBy('holiday_date');
    res.json({ holidays });
  } catch (error) {
    console.error('Get holiday overrides error:', error);
    res.status(500).json({ error: 'Failed to fetch holiday overrides' });
  }
};

export const createHolidayOverride = async (req: Request, res: Response) => {
  try {
    const { holiday_date, holiday_name, description, is_recurring } = req.body;
    
    const [holiday] = await db('holiday_overrides')
      .insert({
        holiday_date,
        holiday_name,
        description,
        is_recurring: is_recurring || false
      })
      .returning('*');

    res.status(201).json({ holiday });
  } catch (error) {
    console.error('Create holiday override error:', error);
    res.status(500).json({ error: 'Failed to create holiday override' });
  }
};

export const deleteHolidayOverride = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('holiday_overrides').where({ id }).del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Holiday override not found' });
    }

    res.json({ message: 'Holiday override deleted successfully' });
  } catch (error) {
    console.error('Delete holiday override error:', error);
    res.status(500).json({ error: 'Failed to delete holiday override' });
  }
};

// Working Hours Configuration
export const getWorkingHoursConfig = async (req: Request, res: Response) => {
  try {
    const [config] = await db('working_hours_config').select('*');
    res.json({ config });
  } catch (error) {
    console.error('Get working hours config error:', error);
    res.status(500).json({ error: 'Failed to fetch working hours configuration' });
  }
};

export const updateWorkingHoursConfig = async (req: Request, res: Response) => {
  try {
    const { default_start_time, default_end_time, lunch_break_minutes, include_weekends, timezone } = req.body;
    
    const [config] = await db('working_hours_config')
      .update({
        default_start_time,
        default_end_time,
        lunch_break_minutes,
        include_weekends,
        timezone: timezone ? JSON.stringify(timezone) : null
      })
      .returning('*');

    res.json({ config });
  } catch (error) {
    console.error('Update working hours config error:', error);
    res.status(500).json({ error: 'Failed to update working hours configuration' });
  }
};

// Role Permissions Configuration
export const getRolePermissionsConfig = async (req: Request, res: Response) => {
  try {
    const permissions = await db('role_permissions_config')
      .select('*')
      .orderBy(['role', 'permission_key']);
    res.json({ permissions });
  } catch (error) {
    console.error('Get role permissions config error:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions configuration' });
  }
};

export const updateRolePermissionsConfig = async (req: Request, res: Response) => {
  try {
    const { permissions } = req.body;

    // Update each permission
    for (const permission of permissions) {
      await db('role_permissions_config')
        .where({ role: permission.role, permission_key: permission.permission_key })
        .update({
          is_enabled: permission.is_enabled,
          description: permission.description
        });
    }

    // Fetch updated permissions
    const updatedPermissions = await db('role_permissions_config')
      .select('*')
      .orderBy(['role', 'permission_key']);

    res.json({ permissions: updatedPermissions });
  } catch (error) {
    console.error('Update role permissions config error:', error);
    res.status(500).json({ error: 'Failed to update role permissions configuration' });
  }
};
