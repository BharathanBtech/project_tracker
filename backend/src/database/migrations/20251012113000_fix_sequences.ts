import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Fix tasks sequence
  const maxTaskId = await knex('tasks').max('id as max_id').first();
  const nextTaskId = (maxTaskId?.max_id as number || 0) + 1;
  
  console.log(`Setting tasks sequence to: ${nextTaskId}`);
  await knex.raw(`SELECT setval('tasks_id_seq', ${nextTaskId}, false)`);
  
  // Fix projects sequence
  const maxProjectId = await knex('projects').max('id as max_id').first();
  const nextProjectId = (maxProjectId?.max_id as number || 0) + 1;
  
  console.log(`Setting projects sequence to: ${nextProjectId}`);
  await knex.raw(`SELECT setval('projects_id_seq', ${nextProjectId}, false)`);
  
  console.log('✅ Sequences fixed successfully!');
}

export async function down(knex: Knex): Promise<void> {
  // No need to rollback sequence fixes
  console.log('Sequence fixes cannot be rolled back');
}
