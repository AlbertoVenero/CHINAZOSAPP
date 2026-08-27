require('dotenv').config();

module.exports = {
  database: {
    host: process.env.MYSQLHOST || process.env.DB_HOST || '127.0.0.1',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'cap',
    database: process.env.MYSQLDATABASE || process.env.DATABASE || process.env.DB_NAME || 'chinazos',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
  }
};
