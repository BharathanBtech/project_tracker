import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, drop the enum constraints to allow updates
  await knex.raw('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check');
  await knex.raw('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
  
  // Update existing project statuses to use proper names
  await knex('projects')
    .where('status', 'active')
    .update({ status: 'In Progress' });

  await knex('projects')
    .where('status', 'on_hold')
    .update({ status: 'On Hold' });

  await knex('projects')
    .where('status', 'completed')
    .update({ status: 'Completed' });

  // Update existing task statuses to use proper names
  await knex('tasks')
    .where('status', 'todo')
    .update({ status: 'To Do' });

  await knex('tasks')
    .where('status', 'in_progress')
    .update({ status: 'In Progress' });

  await knex('tasks')
    .where('status', 'done')
    .update({ status: 'Completed' });

  await knex('tasks')
    .where('status', 'blocked')
    .update({ status: 'Blocked' });
}

export async function down(knex: Knex): Promise<void> {
  // Revert project statuses back to old format
  await knex('projects')
    .where('status', 'In Progress')
    .update({ status: 'active' });

  await knex('projects')
    .where('status', 'On Hold')
    .update({ status: 'on_hold' });

  await knex('projects')
    .where('status', 'Completed')
    .update({ status: 'completed' });

  // Revert task statuses back to old format
  await knex('tasks')
    .where('status', 'To Do')
    .update({ status: 'todo' });

  await knex('tasks')
    .where('status', 'In Progress')
    .update({ status: 'in_progress' });

  await knex('tasks')
    .where('status', 'Completed')
    .update({ status: 'done' });

  await knex('tasks')
    .where('status', 'Blocked')
    .update({ status: 'blocked' });

  // Recreate the enum constraints
  await knex.raw('ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN (\'todo\', \'in_progress\', \'done\', \'blocked\'))');
  await knex.raw('ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN (\'active\', \'on_hold\', \'completed\'))');
}