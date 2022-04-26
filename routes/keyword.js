const app = require('../app');

exports.getSeriesKeyWord = async (sid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select content from KEYWORD as k join REPRESENT as r on k.id=r.kid where sid=" + sid;
		conn.query(sql, function(err, rows) {
			conn.release();
			if(err) console.log("getSeriesKeyWord err");
			else{
				var keywords = [];
				for (var row of rows) {
					keywords.push(row["content"]);
				}
				callback(keywords);
			}
		})
	})
}