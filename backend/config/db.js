const mysql = require('mysql2/promise');

const DB_HOST = 'localhost';
const DB_PORT = 8889; // MAMP MySQL default port
const DB_USER = 'root';
const DB_PASSWORD = 'root'; // Change to '' if your MAMP password is empty
const DB_NAME = 'sentiment_tracker';

let pool = null;

async function initDB() {
  try {
    // 1. Connect to MySQL without specifying a database to create it if missing
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await tempConnection.end();

    // 2. Connect directly to sentiment_tracker database
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });

    // 3. Create 'keywords' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keywords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        term VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 4. Create 'posts' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        keyword_id INT NOT NULL,
        post_text TEXT NOT NULL,
        sentiment_score DECIMAL(5,2) NOT NULL,
        sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('✅ Database & Tables initialized successfully in MAMP MySQL!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized!');
  }
  return pool;
}

module.exports = { initDB, getPool };