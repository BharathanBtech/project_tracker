import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('task_dependencies', (table) => {
    table.increments('id').primary();
    table.integer('task_id').unsigned().notNullable().comment('Dependent task');
    table.integer('depends_on_task_id').unsigned().notNullable().comment('Task that must be completed first');
    table.timestamps(true, true);

    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    table.foreign('depends_on_task_id').references('tasks.id').onDelete('CASCADE');
    table.unique(['task_id', 'depends_on_task_id']);
    table.index('task_id');
    table.index('depends_on_task_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('task_dependencies');
}

