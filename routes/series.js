var express = require('express');
var router = express.Router();
const getConnectionPool = require('../app');

// const mysql = require('mysql');
// const connectionPool = mysql.createPool({
// 	host: process.env.DB_HOST,
// 	user: process.env.DB_USER,
// 	password: process.env.DB_PW,
// 	port: process.env.DB_PORT,
// 	database: process.env.DB_NAME,
// 	insecureAuth: true,
// });

// function getConnectionPool(callback) {
// 	connectionPool.getConnection((err, conn) => {
// 		if(!err) callback(conn);
// 		else console.log("err");
// 	})
// }

router.get('/:id', (req, res) => {
	getConnectionPool((conn) => {
		var sql = "select * from series where id=" + id;
		conn.query(sql, function(err, rows) {
			res.json(rows);
	   })
	   conn.release();
	})
})

module.exports = router;