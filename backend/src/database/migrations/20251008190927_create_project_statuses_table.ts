import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create project_statuses table
  await knex.schema.createTable('project_statuses', (table) => {
    table.increments('id').primary();
    table.integer('project_id').unsigned().notNullable();
    table.string('status_name', 100).notNullable();
    table.string('status_color', 7).defaultTo('#3B82F6'); // Hex color code
    table.integer('status_order').notNullable(); // Order in the flow (0, 1, 2, ...)
    table.text('description').nullable();
    table.boolean('is_start_status').defaultTo(false); // First status in flow
    table.boolean('is_end_status').defaultTo(false); // Final status in flow
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Foreign key
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    
    // Unique constraint: project can't have duplicate status names
    table.unique(['project_id', 'status_name']);
  });

  // Add default statuses for existing projects
  const projects = await knex('projects').select('id');
  
  const defaultStatuses = [
    { status_name: 'Planning', status_color: '#9CA3AF', status_order: 0, is_start_status: true, description: 'Initial planning phase' },
    { status_name: 'In Progress', status_color: '#3B82F6', status_order: 1, description: 'Active development' },
    { status_name: 'Review', status_color: '#F59E0B', status_order: 2, description: 'Under review' },
    { status_name: 'Testing', status_color: '#8B5CF6', status_order: 3, description: 'Quality assurance testing' },
    { status_name: 'Completed', status_color: '#10B981', status_order: 4, is_end_status: true, description: 'Project completed' },
  ];

  for (const project of projects) {
    const statusesWithProjectId = defaultStatuses.map(status => ({
      ...status,
      project_id: project.id,
    }));
    await knex('project_statuses').insert(statusesWithProjectId);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('project_statuses');
}