require('dotenv').config();

module.exports = {
  database: {
    host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'cap',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.DATABASE || 'chinazos',
    port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  }
};
