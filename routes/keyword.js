const app = require('../app');

exports.getSeriesKeyWord = (sid) => {
	app.getConnectionPool((conn) => {
		var sql = "select content from KEYWORD as k join REPRESENT as r on k.id=r.kid where sid=" + sid;
		conn.query(sql, function(err, keywords) {
			conn.release();
			if(err) console.log("getSeriesKeyWord err");
			else{
				console.log(keywords);
				return (keywords);
			}
		})
	})
}