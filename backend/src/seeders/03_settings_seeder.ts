import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing entries
  await knex('role_permissions_config').del();
  await knex('working_hours_config').del();
  await knex('holiday_overrides').del();
  await knex('working_days_config').del();
  await knex('llm_provider_configs').del();
  await knex('llm_providers').del();

  // Insert LLM Providers
  const llmProviders = await knex('llm_providers').insert([
    {
      name: 'openai',
      display_name: 'OpenAI',
      description: 'OpenAI GPT models (GPT-4, GPT-3.5)',
      config_schema: JSON.stringify({
        api_key: { type: 'string', required: true, encrypted: true },
        model_name: { type: 'string', required: false, default: 'gpt-4' },
        temperature: { type: 'number', required: false, default: 0.7, min: 0, max: 2 },
        max_tokens: { type: 'number', required: false, default: 2048, min: 1, max: 4096 }
      }),
      is_active: true,
      is_default: true
    },
    {
      name: 'gemini',
      display_name: 'Google Gemini',
      description: 'Google Gemini AI models',
      config_schema: JSON.stringify({
        api_key: { type: 'string', required: true, encrypted: true },
        model_name: { type: 'string', required: false, default: 'gemini-pro' },
        temperature: { type: 'number', required: false, default: 0.7, min: 0, max: 1 },
        max_tokens: { type: 'number', required: false, default: 2048, min: 1, max: 4096 }
      }),
      is_active: true,
      is_default: false
    },
    {
      name: 'copilot',
      display_name: 'GitHub Copilot',
      description: 'GitHub Copilot AI assistant',
      config_schema: JSON.stringify({
        api_key: { type: 'string', required: true, encrypted: true },
        model_name: { type: 'string', required: false, default: 'copilot-chat' }
      }),
      is_active: true,
      is_default: false
    },
    {
      name: 'cursor',
      display_name: 'Cursor AI',
      description: 'Cursor AI code assistant',
      config_schema: JSON.stringify({
        api_key: { type: 'string', required: true, encrypted: true },
        model_name: { type: 'string', required: false, default: 'cursor-default' }
      }),
      is_active: true,
      is_default: false
    }
  ]).returning('*');

  // Insert Working Days Configuration
  const daysOfWeek = [
    { day: 'monday', name: 'Monday' },
    { day: 'tuesday', name: 'Tuesday' },
    { day: 'wednesday', name: 'Wednesday' },
    { day: 'thursday', name: 'Thursday' },
    { day: 'friday', name: 'Friday' },
    { day: 'saturday', name: 'Saturday' },
    { day: 'sunday', name: 'Sunday' }
  ];

  await knex('working_days_config').insert(
    daysOfWeek.map(day => ({
      day_of_week: day.day,
      is_working_day: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.day),
      start_time: '09:30:00',
      end_time: '18:00:00',
      notes: day.day === 'saturday' ? 'Optional working day (1st & 3rd Saturday)' : null
    }))
  );

  // Insert Holiday Overrides
  await knex('holiday_overrides').insert([
    {
      holiday_date: '2025-01-01',
      holiday_name: 'New Year\'s Day',
      description: 'New Year\'s Day holiday',
      is_recurring: true
    },
    {
      holiday_date: '2025-12-25',
      holiday_name: 'Christmas Day',
      description: 'Christmas Day holiday',
      is_recurring: true
    },
    {
      holiday_date: '2025-07-04',
      holiday_name: 'Independence Day',
      description: 'Independence Day holiday',
      is_recurring: true
    }
  ]);

  // Insert Working Hours Configuration
  await knex('working_hours_config').insert([
    {
      default_start_time: '09:30:00',
      default_end_time: '18:00:00',
      lunch_break_minutes: 60,
      include_weekends: false,
      timezone: JSON.stringify({ name: 'UTC', offset: '+00:00' })
    }
  ]);

  // Insert Role Permissions Configuration
  const rolePermissions = [
    // Admin permissions
    { role: 'admin', permission_key: 'can_view_users', is_enabled: true, description: 'View all users' },
    { role: 'admin', permission_key: 'can_manage_users', is_enabled: true, description: 'Create, edit, delete users' },
    { role: 'admin', permission_key: 'can_create_projects', is_enabled: true, description: 'Create new projects' },
    { role: 'admin', permission_key: 'can_edit_projects', is_enabled: true, description: 'Edit any project' },
    { role: 'admin', permission_key: 'can_delete_projects', is_enabled: true, description: 'Delete projects' },
    { role: 'admin', permission_key: 'can_view_all_projects', is_enabled: true, description: 'View all projects' },
    { role: 'admin', permission_key: 'can_manage_leave_requests', is_enabled: true, description: 'Approve/reject leave requests' },
    { role: 'admin', permission_key: 'can_view_all_tasks', is_enabled: true, description: 'View all tasks' },
    { role: 'admin', permission_key: 'can_manage_project_members', is_enabled: true, description: 'Manage project members' },
    { role: 'admin', permission_key: 'can_access_settings', is_enabled: true, description: 'Access system settings' },

    // Manager permissions
    { role: 'manager', permission_key: 'can_view_users', is_enabled: true, description: 'View team users' },
    { role: 'manager', permission_key: 'can_manage_users', is_enabled: false, description: 'Create, edit, delete users' },
    { role: 'manager', permission_key: 'can_create_projects', is_enabled: true, description: 'Create new projects' },
    { role: 'manager', permission_key: 'can_edit_projects', is_enabled: true, description: 'Edit projects' },
    { role: 'manager', permission_key: 'can_delete_projects', is_enabled: true, description: 'Delete projects' },
    { role: 'manager', permission_key: 'can_view_all_projects', is_enabled: true, description: 'View all projects' },
    { role: 'manager', permission_key: 'can_manage_leave_requests', is_enabled: true, description: 'Approve/reject leave requests' },
    { role: 'manager', permission_key: 'can_view_all_tasks', is_enabled: true, description: 'View all tasks' },
    { role: 'manager', permission_key: 'can_manage_project_members', is_enabled: true, description: 'Manage project members' },
    { role: 'manager', permission_key: 'can_access_settings', is_enabled: true, description: 'Access system settings' },

    // Lead permissions
    { role: 'lead', permission_key: 'can_view_users', is_enabled: true, description: 'View team users' },
    { role: 'lead', permission_key: 'can_manage_users', is_enabled: false, description: 'Create, edit, delete users' },
    { role: 'lead', permission_key: 'can_create_projects', is_enabled: false, description: 'Create new projects' },
    { role: 'lead', permission_key: 'can_edit_projects', is_enabled: false, description: 'Edit projects' },
    { role: 'lead', permission_key: 'can_delete_projects', is_enabled: false, description: 'Delete projects' },
    { role: 'lead', permission_key: 'can_view_all_projects', is_enabled: false, description: 'View all projects' },
    { role: 'lead', permission_key: 'can_manage_leave_requests', is_enabled: false, description: 'Approve/reject leave requests' },
    { role: 'lead', permission_key: 'can_view_all_tasks', is_enabled: true, description: 'View all tasks' },
    { role: 'lead', permission_key: 'can_manage_project_members', is_enabled: true, description: 'Manage project members' },
    { role: 'lead', permission_key: 'can_access_settings', is_enabled: false, description: 'Access system settings' },

    // Member permissions
    { role: 'member', permission_key: 'can_view_users', is_enabled: false, description: 'View users' },
    { role: 'member', permission_key: 'can_manage_users', is_enabled: false, description: 'Manage users' },
    { role: 'member', permission_key: 'can_create_projects', is_enabled: false, description: 'Create projects' },
    { role: 'member', permission_key: 'can_edit_projects', is_enabled: false, description: 'Edit projects' },
    { role: 'member', permission_key: 'can_delete_projects', is_enabled: false, description: 'Delete projects' },
    { role: 'member', permission_key: 'can_view_all_projects', is_enabled: false, description: 'View all projects' },
    { role: 'member', permission_key: 'can_manage_leave_requests', is_enabled: false, description: 'Manage leave requests' },
    { role: 'member', permission_key: 'can_view_all_tasks', is_enabled: false, description: 'View all tasks' },
    { role: 'member', permission_key: 'can_manage_project_members', is_enabled: false, description: 'Manage project members' },
    { role: 'member', permission_key: 'can_access_settings', is_enabled: false, description: 'Access system settings' }
  ];

  await knex('role_permissions_config').insert(rolePermissions);
}
