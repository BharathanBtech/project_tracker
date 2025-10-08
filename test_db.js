const knex = require('knex');

const config = {
  client: 'postgresql',
  connection: {
    host: '172.16.10.130',
    port: 5432,
    database: 'project_tracker',
    user: 'project_tracker',
    password: 'project_tracker'
  }
};

async function testDatabase() {
  const db = knex(config);
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test if task_comments table exists
    const hasTable = await db.schema.hasTable('task_comments');
    console.log('📋 task_comments table exists:', hasTable);
    
    if (hasTable) {
      // Test if we can query the table
      const result = await db('task_comments').select('*').limit(1);
      console.log('✅ Can query task_comments table');
      console.log('📊 Sample data:', result);
      
      // Test if we can insert into the table
      const insertResult = await db('task_comments')
        .insert({
          task_id: 1,
          user_id: 1,
          comment: 'Test comment'
        })
        .returning('*');
      
      console.log('✅ Can insert into task_comments table');
      console.log('📝 Inserted comment:', insertResult);
      
      // Clean up test data
      await db('task_comments').where('id', insertResult[0].id).del();
      console.log('🧹 Cleaned up test data');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('📋 Error details:', error);
  } finally {
    await db.destroy();
  }
}

testDatabase();
