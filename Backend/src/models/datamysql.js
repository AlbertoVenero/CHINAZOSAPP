const mysql = require('mysql2');
const { promisify } = require('util');
const { database } = require('./keys');

// Si existe MYSQL_URL o DATABASE_URL completa (provista por Railway), usarla directamente
const pool = (process.env.MYSQL_URL || process.env.DATABASE_URL)
    ? mysql.createPool(process.env.MYSQL_URL || process.env.DATABASE_URL)
    : mysql.createPool(database);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ [Database] Error de conexión:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('❌ [Database] Conexión cerrada con la base de datos.');
        } else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('❌ [Database] Demasiadas conexiones activas.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('❌ [Database] Conexión rechazada. Verifica que MySQL esté activo en Railway y que las variables DB_HOST/MYSQLHOST y DB_PORT sean correctas.');
        }
        return;
    }
    if (connection) {
        connection.release();
        console.log('✅ [Database] Conexión a MySQL establecida correctamente!');
    }
});

// Promisify para compatibilidad con async/await en controladores existentes
pool.query = promisify(pool.query);

module.exports = pool;
