import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attachments', (table) => {
    // Make task_id nullable to support both task and project attachments
    table.integer('task_id').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('attachments', (table) => {
    // Revert to not null (this might fail if there are null values)
    table.integer('task_id').notNullable().alter();
  });
}
