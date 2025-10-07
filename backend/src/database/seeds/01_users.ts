import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Only seed in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Deletes ALL existing entries
  await knex('users').del();

  const password = await bcrypt.hash('password123', 10);

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@projecttracker.com',
      password_hash: password,
      first_name: 'Admin',
      last_name: 'User',
      department: 'Management',
      role: 'admin',
      is_active: true,
    },
    {
      id: 2,
      email: 'manager@projecttracker.com',
      password_hash: password,
      first_name: 'Manager',
      last_name: 'Smith',
      department: 'Engineering',
      role: 'manager',
      is_active: true,
    },
    {
      id: 3,
      email: 'lead@projecttracker.com',
      password_hash: password,
      first_name: 'Lead',
      last_name: 'Developer',
      department: 'Engineering',
      role: 'lead',
      is_active: true,
    },
    {
      id: 4,
      email: 'john.doe@projecttracker.com',
      password_hash: password,
      first_name: 'John',
      last_name: 'Doe',
      department: 'Engineering',
      role: 'member',
      is_active: true,
    },
    {
      id: 5,
      email: 'jane.smith@projecttracker.com',
      password_hash: password,
      first_name: 'Jane',
      last_name: 'Smith',
      department: 'Engineering',
      role: 'member',
      is_active: true,
    },
    {
      id: 6,
      email: 'mike.wilson@projecttracker.com',
      password_hash: password,
      first_name: 'Mike',
      last_name: 'Wilson',
      department: 'QA',
      role: 'member',
      is_active: true,
    },
    {
      id: 7,
      email: 'sarah.jones@projecttracker.com',
      password_hash: password,
      first_name: 'Sarah',
      last_name: 'Jones',
      department: 'Design',
      role: 'member',
      is_active: true,
    },
    {
      id: 8,
      email: 'david.brown@projecttracker.com',
      password_hash: password,
      first_name: 'David',
      last_name: 'Brown',
      department: 'Business Analysis',
      role: 'member',
      is_active: true,
    },
  ]);
}

