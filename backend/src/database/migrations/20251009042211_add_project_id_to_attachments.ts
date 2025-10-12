import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('attachments', (table) => {
    // Add project_id column for project attachments
    table.integer('project_id').unsigned().nullable().comment('Project ID for project-related attachments');
    
    // Add foreign key constraint
    table.foreign('project_id').references('projects.id').onDelete('CASCADE');
    
    // Add description column for better attachment metadata
    table.text('description').nullable().comment('Description of the attachment');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('attachments', (table) => {
    // Drop foreign key constraint first
    table.dropForeign(['project_id']);
    
    // Drop columns
    table.dropColumn('project_id');
    table.dropColumn('description');
  });
}