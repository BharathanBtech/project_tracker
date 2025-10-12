import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Only seed in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Deletes ALL existing entries
  await knex('project_statuses').del();

  // Default project statuses that can be used across projects
  const defaultStatuses = [
    // Project 1 (E-Commerce Platform) statuses
    {
      project_id: 1,
      status_name: 'Planning',
      status_color: '#9CA3AF',
      status_order: 0,
      description: 'Initial planning phase',
      is_start_status: true,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 1,
      status_name: 'In Progress',
      status_color: '#3B82F6',
      status_order: 1,
      description: 'Active development',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 1,
      status_name: 'Review',
      status_color: '#F59E0B',
      status_order: 2,
      description: 'Under review',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 1,
      status_name: 'Testing',
      status_color: '#8B5CF6',
      status_order: 3,
      description: 'Quality assurance testing',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 1,
      status_name: 'Completed',
      status_color: '#10B981',
      status_order: 4,
      description: 'Project completed',
      is_start_status: false,
      is_end_status: true,
      is_active: true,
    },

    // Project 2 (Mobile Banking App) statuses
    {
      project_id: 2,
      status_name: 'Planning',
      status_color: '#9CA3AF',
      status_order: 0,
      description: 'Initial planning phase',
      is_start_status: true,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 2,
      status_name: 'Development',
      status_color: '#3B82F6',
      status_order: 1,
      description: 'Active development',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 2,
      status_name: 'Security Review',
      status_color: '#EF4444',
      status_order: 2,
      description: 'Security and compliance review',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 2,
      status_name: 'Testing',
      status_color: '#8B5CF6',
      status_order: 3,
      description: 'Quality assurance testing',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 2,
      status_name: 'Deployed',
      status_color: '#10B981',
      status_order: 4,
      description: 'Successfully deployed',
      is_start_status: false,
      is_end_status: true,
      is_active: true,
    },

    // Project 3 (Internal HR Portal) statuses
    {
      project_id: 3,
      status_name: 'Planning',
      status_color: '#9CA3AF',
      status_order: 0,
      description: 'Initial planning phase',
      is_start_status: true,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 3,
      status_name: 'Development',
      status_color: '#3B82F6',
      status_order: 1,
      description: 'Active development',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 3,
      status_name: 'On Hold',
      status_color: '#F59E0B',
      status_order: 2,
      description: 'Project temporarily suspended',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 3,
      status_name: 'Testing',
      status_color: '#8B5CF6',
      status_order: 3,
      description: 'Quality assurance testing',
      is_start_status: false,
      is_end_status: false,
      is_active: true,
    },
    {
      project_id: 3,
      status_name: 'Completed',
      status_color: '#10B981',
      status_order: 4,
      description: 'Project completed',
      is_start_status: false,
      is_end_status: true,
      is_active: true,
    },
  ];

  // Inserts seed entries
  await knex('project_statuses').insert(defaultStatuses);
}
