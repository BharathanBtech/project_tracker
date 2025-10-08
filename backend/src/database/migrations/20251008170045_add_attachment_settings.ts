import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Attachment Configuration table
  await knex.schema.createTable('attachment_config', (table) => {
    table.increments('id').primary();
    table.string('config_key').notNullable().unique(); // max_file_size, allowed_file_types, etc.
    table.text('config_value').notNullable(); // JSON or string value
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Insert default attachment configuration
  await knex('attachment_config').insert([
    {
      config_key: 'max_file_size',
      config_value: JSON.stringify({
        value: 5 * 1024 * 1024, // 5MB in bytes
        unit: 'MB',
        display_value: 5
      }),
      description: 'Maximum file size for attachments (in bytes)',
      is_active: true
    },
    {
      config_key: 'allowed_file_types',
      config_value: JSON.stringify([
        'image/jpeg',
        'image/png', 
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
      ]),
      description: 'Allowed MIME types for file uploads',
      is_active: true
    },
    {
      config_key: 'allowed_file_extensions',
      config_value: JSON.stringify([
        '.jpg', '.jpeg', '.png', '.gif', '.pdf', 
        '.doc', '.docx', '.txt', '.zip', '.rar'
      ]),
      description: 'Allowed file extensions',
      is_active: true
    },
    {
      config_key: 'enable_url_attachments',
      config_value: JSON.stringify({
        enabled: true,
        allowed_domains: ['*'], // Allow all domains, can be restricted
        require_https: false
      }),
      description: 'Enable URL-based attachments',
      is_active: true
    }
  ]);
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attachment_config');
}