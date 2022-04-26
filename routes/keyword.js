const app = require('../app');

exports.getSeriesKeyWord = (sid) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from KEYWORD where sid=" + sid;
		conn.query(sql, function(err, keywords) {
			if(err) console.log("getSeriesKeyWord err");
			else return (keywords);
		})
		conn.release();
	})
}