import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Only seed in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Deletes ALL existing entries
  await knex('project_members').del();

  // Inserts seed entries
  await knex('project_members').insert([
    // E-Commerce Platform team
    { project_id: 1, user_id: 3, project_role: 'project_manager' },
    { project_id: 1, user_id: 4, project_role: 'developer' },
    { project_id: 1, user_id: 5, project_role: 'developer' },
    { project_id: 1, user_id: 6, project_role: 'tester' },
    { project_id: 1, user_id: 7, project_role: 'designer' },
    { project_id: 1, user_id: 8, project_role: 'business_analyst' },

    // Mobile Banking App team
    { project_id: 2, user_id: 3, project_role: 'project_manager' },
    { project_id: 2, user_id: 4, project_role: 'developer' },
    { project_id: 2, user_id: 6, project_role: 'tester' },
    { project_id: 2, user_id: 8, project_role: 'business_analyst' },

    // Internal HR Portal team
    { project_id: 3, user_id: 2, project_role: 'project_manager' },
    { project_id: 3, user_id: 5, project_role: 'developer' },
    { project_id: 3, user_id: 7, project_role: 'designer' },
  ]);
}

