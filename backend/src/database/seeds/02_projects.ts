import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Only seed in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Deletes ALL existing entries
  await knex('projects').del();

  // Inserts seed entries
  await knex('projects').insert([
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with AI-powered recommendations',
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      status: 'active',
      created_by: 2,
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      description: 'Secure mobile banking application with biometric authentication',
      start_date: '2025-02-01',
      end_date: '2025-08-31',
      status: 'active',
      created_by: 2,
    },
    {
      id: 3,
      title: 'Internal HR Portal',
      description: 'Employee management and HR automation system',
      start_date: '2024-10-01',
      end_date: '2025-03-31',
      status: 'on_hold',
      created_by: 1,
    },
  ]);
}

