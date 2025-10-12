import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, update any existing projects with null start_date to have a default date
  await knex('projects')
    .whereNull('start_date')
    .update({ start_date: knex.fn.now() });

  // Make start_date required and end_date optional
  await knex.schema.alterTable('projects', (table) => {
    table.date('start_date').notNullable().alter();
    // end_date remains optional (nullable)
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert start_date to optional
  await knex.schema.alterTable('projects', (table) => {
    table.date('start_date').nullable().alter();
  });
}