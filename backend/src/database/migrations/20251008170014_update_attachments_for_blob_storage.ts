import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, update existing records to have default values
  await knex('attachments')
    .whereNull('file_path')
    .update({ file_path: '' });

  return knex.schema.alterTable('attachments', (table) => {
    // Add BLOB storage for file content (PostgreSQL uses bytea)
    table.specificType('file_content', 'bytea').comment('File content stored as BLOB');
    
    // Add URL support for external file references
    table.string('file_url', 1000).comment('External URL for file reference');
    
    // Add attachment type to distinguish between uploaded files and URLs
    table.enum('attachment_type', ['file', 'url']).defaultTo('file').comment('Type of attachment: file or URL');
    
    // Make file_path optional since we can store content as BLOB or use URL
    table.string('file_path', 500).nullable().alter();
    
    // Add file hash for integrity checking
    table.string('file_hash', 64).comment('SHA-256 hash of file content for integrity');
    
    // Add MIME type for better file handling
    table.string('mime_type', 100).comment('MIME type of the file');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('attachments', (table) => {
    table.dropColumn('file_content');
    table.dropColumn('file_url');
    table.dropColumn('attachment_type');
    table.dropColumn('file_hash');
    table.dropColumn('mime_type');
    
    // Restore file_path as required
    table.string('file_path', 500).notNullable().alter();
  });
}