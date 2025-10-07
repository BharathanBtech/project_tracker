import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('attachments', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().notNullable();
    table.string('file_name', 255).notNullable();
    table.string('file_path', 500).notNullable();
    table.string('file_type', 100);
    table.integer('file_size').comment('File size in bytes');
    table.integer('uploaded_by').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    table.foreign('uploaded_by').references('users.id').onDelete('RESTRICT');
    table.index('task_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attachments');
}

