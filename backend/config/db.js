const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sentiment_tracker',
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}
if (!/^[A-Za-z0-9_]+$/.test(config.database)) {
  throw new Error('DB_NAME may contain only letters, numbers, and underscores');
}

let pool;

async function initDB() {
  // Create the database if needed, then create tables only when absent.
  // Never drop tables here: this function runs whenever the API starts.
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }

  pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    charset: 'utf8mb4',
    dateStrings: true,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS keywords (
      id INT AUTO_INCREMENT PRIMARY KEY,
      term VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      keyword_id INT NOT NULL,
      post_text TEXT NOT NULL,
      sentiment_score DECIMAL(7,2) NOT NULL DEFAULT 0,
      sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL DEFAULT 'neutral',
      latitude DECIMAL(10, 8) NULL,
      longitude DECIMAL(11, 8) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_posts_created_at (created_at),
      INDEX idx_posts_keyword_id (keyword_id),
      CONSTRAINT fk_posts_keyword FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Existing installations with the original schema are compatible. We do not
  // automatically alter unknown schemas; schema changes should be explicit migrations.
  console.log(`Database ready: ${config.database} (existing tables/data preserved).`);
  return pool;
}

function getPool() {
  if (!pool) throw new Error('Database pool not initialized. Await initDB() first.');
  return pool;
}

async function closeDB() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = { initDB, getPool, closeDB };
