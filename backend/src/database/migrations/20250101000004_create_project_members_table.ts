import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('project_members', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.enum('project_role', ['developer', 'tester', 'business_analyst', 'designer', 'devops', 'project_manager']).notNullable();
    table.timestamps(true, true);

    table.foreign('project_id').references('projects.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.unique(['project_id', 'user_id']);
    table.index('project_id');
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('project_members');
}

