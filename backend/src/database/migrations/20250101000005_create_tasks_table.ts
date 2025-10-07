import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable();
    table.string('title', 255).notNullable();
    table.text('description');
    table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
    table.enum('status', ['todo', 'in_progress', 'done', 'blocked']).notNullable().defaultTo('todo');
    table.integer('complexity').notNullable().defaultTo(3).comment('1-5 stars complexity rating');
    table.date('due_date');
    table.decimal('estimated_hours', 8, 2);
    table.integer('assigned_to').unsigned();
    table.integer('created_by').unsigned().notNullable();
    table.integer('parent_task_id').unsigned().comment('For subtasks');
    table.timestamps(true, true);

    table.foreign('project_id').references('projects.id').onDelete('CASCADE');
    table.foreign('assigned_to').references('users.id').onDelete('SET NULL');
    table.foreign('created_by').references('users.id').onDelete('RESTRICT');
    table.foreign('parent_task_id').references('tasks.id').onDelete('CASCADE');
    table.index('project_id');
    table.index('assigned_to');
    table.index('status');
    table.index('priority');
    table.index('due_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tasks');
}

