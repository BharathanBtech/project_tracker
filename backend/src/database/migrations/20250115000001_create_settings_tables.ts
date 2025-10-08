import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // LLM Providers table
  await knex.schema.createTable('llm_providers', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique(); // OpenAI, Gemini, Copilot, Cursor
    table.string('display_name').notNullable();
    table.text('description').nullable();
    table.json('config_schema').nullable(); // JSON schema for provider-specific config
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);
  });

  // LLM Provider Configurations table
  await knex.schema.createTable('llm_provider_configs', (table) => {
    table.increments('id').primary();
    table.integer('provider_id').unsigned().references('id').inTable('llm_providers').onDelete('CASCADE');
    table.string('config_key').notNullable(); // api_key, model_name, temperature, max_tokens
    table.text('config_value').nullable(); // encrypted value
    table.boolean('is_encrypted').defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['provider_id', 'config_key']);
  });

  // Working Days Configuration table
  await knex.schema.createTable('working_days_config', (table) => {
    table.increments('id').primary();
    table.string('day_of_week').notNullable(); // monday, tuesday, etc.
    table.boolean('is_working_day').defaultTo(true);
    table.time('start_time').nullable(); // Override start time for specific days
    table.time('end_time').nullable(); // Override end time for specific days
    table.text('notes').nullable(); // Special notes for this day
    table.timestamps(true, true);
    
    table.unique(['day_of_week']);
  });

  // Holiday Overrides table
  await knex.schema.createTable('holiday_overrides', (table) => {
    table.increments('id').primary();
    table.date('holiday_date').notNullable();
    table.string('holiday_name').notNullable();
    table.text('description').nullable();
    table.boolean('is_recurring').defaultTo(false); // Annual recurring holiday
    table.timestamps(true, true);
    
    table.unique(['holiday_date']);
  });

  // Working Hours Configuration table
  await knex.schema.createTable('working_hours_config', (table) => {
    table.increments('id').primary();
    table.time('default_start_time').notNullable(); // 09:30
    table.time('default_end_time').notNullable(); // 18:00
    table.integer('lunch_break_minutes').defaultTo(60); // Lunch break duration
    table.boolean('include_weekends').defaultTo(false);
    table.json('timezone').nullable(); // Timezone configuration
    table.timestamps(true, true);
  });

  // Role Permissions Configuration table
  await knex.schema.createTable('role_permissions_config', (table) => {
    table.increments('id').primary();
    table.string('role').notNullable(); // admin, manager, lead, member
    table.string('permission_key').notNullable(); // can_create_projects, can_view_all_projects, etc.
    table.boolean('is_enabled').defaultTo(true);
    table.text('description').nullable();
    table.timestamps(true, true);
    
    table.unique(['role', 'permission_key']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('role_permissions_config');
  await knex.schema.dropTable('working_hours_config');
  await knex.schema.dropTable('holiday_overrides');
  await knex.schema.dropTable('working_days_config');
  await knex.schema.dropTable('llm_provider_configs');
  await knex.schema.dropTable('llm_providers');
}
