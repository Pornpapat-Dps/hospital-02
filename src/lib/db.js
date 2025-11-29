// lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
    DATABASE_URL: process.env.DATABASE_URL,
  host: process.env.DB_HOST ,
  port:  process.env.DB_PORT ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database:  process.env.DB_NAME,
  max: 10, // จำนวน connection สูงสุดใน pool
  idleTimeoutMillis: 30000, // connection idle 30 วิแล้วตัด
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }   // ← บังคับใช้ SSL
});

// ทดสอบการเชื่อมต่อ
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL (Local)');
    client.release(); // ปล่อย connection กลับ pool
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
  });

pool.on('error', (err) => {
  console.error('🔥 PostgreSQL pool error:', err.message);
});


export default pool;