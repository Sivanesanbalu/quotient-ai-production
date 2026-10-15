import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not configured. Set it privately; never commit database credentials.');
  process.exit(1);
}

const required = {
  accounts: ['id','email','password_hash','name'],
  sessions: ['token_hash','account_id','expires_at'],
  rfqs: ['id','account_id','product','quantity','unit','spec','status','created_at'],
  suppliers: ['id','account_id','name','email','phone','website','created_at'],
  quotes: ['id','account_id','rfq_id','supplier_id','amount','notes','created_at'],
  auth_rate_limits: ['key','hits','reset_at']
};

const sql = postgres(process.env.DATABASE_URL, { ssl:'require', max:1, connect_timeout:10, idle_timeout:5 });
try {
  const columns = await sql`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'`;
  const available = new Set(columns.map(c=>c.table_name+'.'+c.column_name));
  const missing = Object.entries(required).flatMap(([table,names]) =>
    names.filter(name=>!available.has(table+'.'+name)).map(name=>table+'.'+name));
  if (missing.length) {
    console.error('Database schema incomplete. Missing: '+missing.join(', '));
    process.exitCode = 1;
  } else {
    console.log('Database schema verified: all six required tables and API columns exist.');
  }
} catch (error) {
  console.error('Database verification failed: '+(error.code||'connection_error')+'. Check Vercel DATABASE_URL and Neon access.');
  process.exitCode = 1;
} finally {
  await sql.end({timeout:3});
}
