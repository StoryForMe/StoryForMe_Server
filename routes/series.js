var express = require('express');
var router = express.Router();
const app = require('../app');

router.get('/:id', (req, res) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from SERIES where id=" + req.params.id;
		conn.query(sql, function(err, rows) {
			res.json(rows);
	   })
	   conn.release();
	})
})

module.exports = router;
