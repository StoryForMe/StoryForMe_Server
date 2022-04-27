const app = require('../app');

exports.getSeriesKeyword = async (sid, callback) => {
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

exports.postSeriesKeyword = (sid, kid_list, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into REPRESENT values (" + sid + ", " + kid_list[index] + ")";
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(index + 1);
		})
	})
}

exports.getKeywordId = (keywords, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from KEYWORD where content='" + keywords[index] + "'";
		conn.query(sql, function(err, keyword_list) {
			conn.release();
			if (err) console.log(err);
			else{
				if(keyword_list.length == 0)
					postKeyword(keywords[index], (kid) => { callback(kid, index + 1); });
				else
					callback(keyword_list[0]["id"], index + 1);
			}
		})
	})
}

postKeyword = (keyword, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into KEYWORD (search, content, hits) values (0, '" + keyword + "', 0)";
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else callback(results.insertId);
		})
	})
}