import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Only seed in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Deletes ALL existing entries
  await knex('leave_dates').del();

  // Inserts seed entries
  await knex('leave_dates').insert([
    {
      user_id: 4,
      start_date: '2025-02-10',
      end_date: '2025-02-12',
      reason: 'Personal vacation',
      status: 'approved',
    },
    {
      user_id: 5,
      start_date: '2025-03-15',
      end_date: '2025-03-20',
      reason: 'Family trip',
      status: 'approved',
    },
    {
      user_id: 6,
      start_date: '2025-02-20',
      end_date: '2025-02-21',
      reason: 'Medical appointment',
      status: 'pending',
    },
    {
      user_id: 7,
      start_date: '2025-04-01',
      end_date: '2025-04-05',
      reason: 'Vacation',
      status: 'pending',
    },
  ]);
}

