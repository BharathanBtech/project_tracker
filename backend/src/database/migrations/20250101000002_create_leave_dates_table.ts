import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('leave_dates', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.string('reason', 500);
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.timestamps(true, true);

    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.index('user_id');
    table.index('start_date');
    table.index('end_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('leave_dates');
}

