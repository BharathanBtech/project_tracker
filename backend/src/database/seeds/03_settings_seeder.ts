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
      is_active: false,
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
      is_active: false,
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
      is_active: false,
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

  // Insert Role Permissions Configuration (using camelCase for consistency with frontend)
  const rolePermissions = [
    // Admin permissions (all enabled)
    { role: 'admin', permission_key: 'canViewUsers', is_enabled: true, description: 'View user list and profiles' },
    { role: 'admin', permission_key: 'canManageUsers', is_enabled: true, description: 'Create, edit, and delete users' },
    { role: 'admin', permission_key: 'canCreateProjects', is_enabled: true, description: 'Create new projects' },
    { role: 'admin', permission_key: 'canDeleteProjects', is_enabled: true, description: 'Delete existing projects' },
    { role: 'admin', permission_key: 'canViewAllProjects', is_enabled: true, description: 'View all projects in the system' },
    { role: 'admin', permission_key: 'canManageLeaveRequests', is_enabled: true, description: 'Approve/reject leave requests' },
    { role: 'admin', permission_key: 'canViewAllTasks', is_enabled: true, description: 'View all tasks across projects' },
    { role: 'admin', permission_key: 'canManageProjectMembers', is_enabled: true, description: 'Add/remove members from projects' },
    { role: 'admin', permission_key: 'canAccessSettings', is_enabled: true, description: 'Access system settings and configuration' },
    { role: 'admin', permission_key: 'canEditBasicTaskDetails', is_enabled: true, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'admin', permission_key: 'canReassignTask', is_enabled: true, description: 'Change task assignment to another user' },
    { role: 'admin', permission_key: 'canAddComments', is_enabled: true, description: 'Add comments to tasks' },
    { role: 'admin', permission_key: 'canEditOwnComments', is_enabled: true, description: 'Edit comments created by self' },
    { role: 'admin', permission_key: 'canDeleteOwnComments', is_enabled: true, description: 'Delete comments created by self' },
    { role: 'admin', permission_key: 'canDeleteAnyComments', is_enabled: true, description: 'Delete any user\'s comments' },
    { role: 'admin', permission_key: 'canDeleteOwnAttachments', is_enabled: true, description: 'Delete attachments uploaded by self' },
    { role: 'admin', permission_key: 'canDeleteAnyAttachments', is_enabled: true, description: 'Delete any user\'s attachments' },

    // Manager permissions
    { role: 'manager', permission_key: 'canViewUsers', is_enabled: true, description: 'View user list and profiles' },
    { role: 'manager', permission_key: 'canManageUsers', is_enabled: true, description: 'Create, edit, and delete users' },
    { role: 'manager', permission_key: 'canCreateProjects', is_enabled: true, description: 'Create new projects' },
    { role: 'manager', permission_key: 'canDeleteProjects', is_enabled: true, description: 'Delete existing projects' },
    { role: 'manager', permission_key: 'canViewAllProjects', is_enabled: true, description: 'View all projects in the system' },
    { role: 'manager', permission_key: 'canManageLeaveRequests', is_enabled: true, description: 'Approve/reject leave requests' },
    { role: 'manager', permission_key: 'canViewAllTasks', is_enabled: true, description: 'View all tasks across projects' },
    { role: 'manager', permission_key: 'canManageProjectMembers', is_enabled: true, description: 'Add/remove members from projects' },
    { role: 'manager', permission_key: 'canAccessSettings', is_enabled: true, description: 'Access system settings and configuration' },
    { role: 'manager', permission_key: 'canEditBasicTaskDetails', is_enabled: true, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'manager', permission_key: 'canReassignTask', is_enabled: true, description: 'Change task assignment to another user' },
    { role: 'manager', permission_key: 'canAddComments', is_enabled: true, description: 'Add comments to tasks' },
    { role: 'manager', permission_key: 'canEditOwnComments', is_enabled: true, description: 'Edit comments created by self' },
    { role: 'manager', permission_key: 'canDeleteOwnComments', is_enabled: true, description: 'Delete comments created by self' },
    { role: 'manager', permission_key: 'canDeleteAnyComments', is_enabled: true, description: 'Delete any user\'s comments' },
    { role: 'manager', permission_key: 'canDeleteOwnAttachments', is_enabled: true, description: 'Delete attachments uploaded by self' },
    { role: 'manager', permission_key: 'canDeleteAnyAttachments', is_enabled: true, description: 'Delete any user\'s attachments' },

    // Lead permissions
    { role: 'lead', permission_key: 'canViewUsers', is_enabled: true, description: 'View user list and profiles' },
    { role: 'lead', permission_key: 'canManageUsers', is_enabled: false, description: 'Create, edit, and delete users' },
    { role: 'lead', permission_key: 'canCreateProjects', is_enabled: false, description: 'Create new projects' },
    { role: 'lead', permission_key: 'canDeleteProjects', is_enabled: false, description: 'Delete existing projects' },
    { role: 'lead', permission_key: 'canViewAllProjects', is_enabled: false, description: 'View all projects in the system' },
    { role: 'lead', permission_key: 'canManageLeaveRequests', is_enabled: true, description: 'Approve/reject leave requests' },
    { role: 'lead', permission_key: 'canViewAllTasks', is_enabled: false, description: 'View all tasks across projects' },
    { role: 'lead', permission_key: 'canManageProjectMembers', is_enabled: true, description: 'Add/remove members from projects' },
    { role: 'lead', permission_key: 'canAccessSettings', is_enabled: false, description: 'Access system settings and configuration' },
    { role: 'lead', permission_key: 'canEditBasicTaskDetails', is_enabled: false, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'lead', permission_key: 'canReassignTask', is_enabled: false, description: 'Change task assignment to another user' },
    { role: 'lead', permission_key: 'canAddComments', is_enabled: false, description: 'Add comments to tasks' },
    { role: 'lead', permission_key: 'canEditOwnComments', is_enabled: false, description: 'Edit comments created by self' },
    { role: 'lead', permission_key: 'canDeleteOwnComments', is_enabled: false, description: 'Delete comments created by self' },
    { role: 'lead', permission_key: 'canDeleteAnyComments', is_enabled: false, description: 'Delete any user\'s comments' },
    { role: 'lead', permission_key: 'canDeleteOwnAttachments', is_enabled: false, description: 'Delete attachments uploaded by self' },
    { role: 'lead', permission_key: 'canDeleteAnyAttachments', is_enabled: false, description: 'Delete any user\'s attachments' },

    // Member permissions
    { role: 'member', permission_key: 'canViewUsers', is_enabled: true, description: 'View user list and profiles' },
    { role: 'member', permission_key: 'canManageUsers', is_enabled: false, description: 'Create, edit, and delete users' },
    { role: 'member', permission_key: 'canCreateProjects', is_enabled: false, description: 'Create new projects' },
    { role: 'member', permission_key: 'canDeleteProjects', is_enabled: false, description: 'Delete existing projects' },
    { role: 'member', permission_key: 'canViewAllProjects', is_enabled: false, description: 'View all projects in the system' },
    { role: 'member', permission_key: 'canManageLeaveRequests', is_enabled: false, description: 'Approve/reject leave requests' },
    { role: 'member', permission_key: 'canViewAllTasks', is_enabled: false, description: 'View all tasks across projects' },
    { role: 'member', permission_key: 'canManageProjectMembers', is_enabled: false, description: 'Add/remove members from projects' },
    { role: 'member', permission_key: 'canAccessSettings', is_enabled: false, description: 'Access system settings and configuration' },
    { role: 'member', permission_key: 'canEditBasicTaskDetails', is_enabled: false, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'member', permission_key: 'canReassignTask', is_enabled: false, description: 'Change task assignment to another user' },
    { role: 'member', permission_key: 'canAddComments', is_enabled: false, description: 'Add comments to tasks' },
    { role: 'member', permission_key: 'canEditOwnComments', is_enabled: false, description: 'Edit comments created by self' },
    { role: 'member', permission_key: 'canDeleteOwnComments', is_enabled: false, description: 'Delete comments created by self' },
    { role: 'member', permission_key: 'canDeleteAnyComments', is_enabled: false, description: 'Delete any user\'s comments' },
    { role: 'member', permission_key: 'canDeleteOwnAttachments', is_enabled: false, description: 'Delete attachments uploaded by self' },
    { role: 'member', permission_key: 'canDeleteAnyAttachments', is_enabled: false, description: 'Delete any user\'s attachments' },

    // Task Assignee permissions (context role)
    { role: 'task_assignee', permission_key: 'canEditBasicTaskDetails', is_enabled: true, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'task_assignee', permission_key: 'canReassignTask', is_enabled: false, description: 'Change task assignment to another user' },
    { role: 'task_assignee', permission_key: 'canAddComments', is_enabled: true, description: 'Add comments to tasks' },
    { role: 'task_assignee', permission_key: 'canEditOwnComments', is_enabled: true, description: 'Edit comments created by self' },
    { role: 'task_assignee', permission_key: 'canDeleteOwnComments', is_enabled: true, description: 'Delete comments created by self' },
    { role: 'task_assignee', permission_key: 'canDeleteAnyComments', is_enabled: false, description: 'Delete any user\'s comments' },
    { role: 'task_assignee', permission_key: 'canDeleteOwnAttachments', is_enabled: true, description: 'Delete attachments uploaded by self' },
    { role: 'task_assignee', permission_key: 'canDeleteAnyAttachments', is_enabled: false, description: 'Delete any user\'s attachments' },

    // Task Creator permissions (context role)
    { role: 'task_creator', permission_key: 'canEditBasicTaskDetails', is_enabled: true, description: 'Edit task title, description, status, priority, etc.' },
    { role: 'task_creator', permission_key: 'canReassignTask', is_enabled: true, description: 'Change task assignment to another user' },
    { role: 'task_creator', permission_key: 'canAddComments', is_enabled: true, description: 'Add comments to tasks' },
    { role: 'task_creator', permission_key: 'canEditOwnComments', is_enabled: true, description: 'Edit comments created by self' },
    { role: 'task_creator', permission_key: 'canDeleteOwnComments', is_enabled: true, description: 'Delete comments created by self' },
    { role: 'task_creator', permission_key: 'canDeleteAnyComments', is_enabled: false, description: 'Delete any user\'s comments' },
    { role: 'task_creator', permission_key: 'canDeleteOwnAttachments', is_enabled: true, description: 'Delete attachments uploaded by self' },
    { role: 'task_creator', permission_key: 'canDeleteAnyAttachments', is_enabled: false, description: 'Delete any user\'s attachments' }
  ];

  await knex('role_permissions_config').insert(rolePermissions);
}
