import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('projects', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description');
    table.date('start_date');
    table.date('end_date');
    table.enum('status', ['active', 'on_hold', 'completed']).notNullable().defaultTo('active');
    table.integer('created_by').unsigned().notNullable();
    table.timestamps(true, true);

    table.foreign('created_by').references('users.id').onDelete('RESTRICT');
    table.index('status');
    table.index('created_by');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('projects');
}

