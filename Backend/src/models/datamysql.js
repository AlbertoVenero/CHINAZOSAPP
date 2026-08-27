const mysql = require('mysql');
const { promisify } = require('util');
const { database } = require('./keys');
const pool = mysql.createPool(database);
pool.getConnection((err, connection) =>{
	if (err){
		if (err.code === 'PROTOCOL_CONNECTION_LOST'){
			console.error('CONEXION DE LA BASE DE DATOS FUE CERRADA');
		}
		if (err.code === 'ER_CON_COUNT_ERROR'){
			console.error('EXISTE MUCHA CONEXION EN LA BASE DE DATOS');
		}
		if (err.code === 'ECONNREFUSED'){
			console.error('CONEXION DE LA BASE DE DATOS FUE RECHAZADA');
		}
	}
	if ( connection ) connection.release();
	  console.log('DB esta conectada!!');
	  return;
})
pool.query = promisify(pool.query);
module.exports = pool;
