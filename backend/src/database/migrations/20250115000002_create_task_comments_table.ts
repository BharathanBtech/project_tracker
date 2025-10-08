import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('task_comments', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.text('comment').notNullable();
    table.timestamps(true, true);

    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.index('task_id');
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('task_comments');
}
