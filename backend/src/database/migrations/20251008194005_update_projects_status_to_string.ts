import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, drop the enum constraint
  await knex.schema.alterTable('projects', (table) => {
    table.dropColumn('status');
  });

  // Add the new string column
  await knex.schema.alterTable('projects', (table) => {
    table.string('status', 100).notNullable().defaultTo('Planning');
  });

  // Update existing projects to use the new status format
  await knex('projects')
    .where({ status: 'Planning' })
    .update({ status: 'In Progress' });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the string column
  await knex.schema.alterTable('projects', (table) => {
    table.dropColumn('status');
  });

  // Re-add the enum column
  await knex.schema.alterTable('projects', (table) => {
    table.enum('status', ['active', 'on_hold', 'completed']).notNullable().defaultTo('active');
  });

  // Update existing projects back to enum format
  await knex('projects')
    .whereIn('status', ['In Progress', 'Active', 'Planning'])
    .update({ status: 'active' });
  
  await knex('projects')
    .where({ status: 'On Hold' })
    .update({ status: 'on_hold' });
    
  await knex('projects')
    .whereIn('status', ['Completed', 'Done'])
    .update({ status: 'completed' });
}