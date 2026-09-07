const mysql = require('mysql2/promise');

// MAMP Connection Settings
const DB_HOST = 'localhost';
const DB_PORT = 8889;        // MAMP MySQL Default Port
const DB_USER = 'root';
const DB_PASSWORD = 'root';    // Change to '' if your MAMP password is empty
const DB_NAME = 'sentiment_tracker';

let pool = null;

async function initDB() {
  try {
    // 1. Connection check / DB creation
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await tempConnection.end();

    // 2. Main Connection Pool
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });

    // 3. Drop existing tables for a clean restart
    await pool.query('DROP TABLE IF EXISTS posts;');
    await pool.query('DROP TABLE IF EXISTS keywords;');

    // 4. Keywords Table
    await pool.query(`
      CREATE TABLE keywords (
        id INT AUTO_INCREMENT PRIMARY KEY,
        term VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 5. Posts Table
    await pool.query(`
      CREATE TABLE posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        keyword_id INT NOT NULL,
        post_text TEXT NOT NULL,
        sentiment_score DECIMAL(5,2) NOT NULL,
        sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('🗑️  Old tables dropped successfully.');
    console.log('✅ Fresh Database & Tables initialized in MAMP MySQL!');
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