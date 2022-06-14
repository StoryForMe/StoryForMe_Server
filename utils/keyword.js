const app = require('../app');

/************************************************************/
/************************** SERIES **************************/
/************************************************************/

// sid에 해당하는 시리즈의 키워드 목록을 가져옴.
exports.getSeriesKeyword = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select content from KEYWORD as k join REPRESENT as r on k.id=r.kid where sid=" + sid;
		conn.query(sql, function(err, rows) {
			conn.release();
			if(err) console.log(err);
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
// sid에 해당하는 시리즈에 kid_list에 있는 kid에 해당하는 키워드를 추가.
function postSeriesKeyword (sid, kid_list, index, callback) {
	app.getConnectionPool((conn) => {
		var sql = "insert into REPRESENT values (" + sid + ", " + kid_list[index] + ")";
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(index + 1);
		})
	})
}
exports.postSeriesKeyword = postSeriesKeyword;
// sid에 해당하는 시리즈의 기존 키워드를 삭제한 뒤 새로운 키워드 목록 추가.
exports.updateSeriesKeyword = (sid, kid_list, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from REPRESENT where sid=" + sid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else if (kid_list == null) {
				callback();
			}
			else postSeriesKeyword(sid, kid_list, 0, callback);
		})
	})
}
// keyword 목록을 받아 각각의 키워드에 해당하는 kid를 가져옴. 
// 해당 키워드가 존재하지 않는다면 postKeyword를 호출해 해당 키워드를 추가한 뒤 그 키워드의 kid를 가져옴.
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


/*************************************************************/
/*************************** USER ****************************/
/*************************************************************/

// uid애 해당하는 user가 like로 등록한 keyword들을 가져옴
exports.getUserKeyword = (res, uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select id from KEYWORD as k join LIKE as l on k.id=l.kid where uid=" + uid;
		conn.query(sql, function(err, rows) {
			conn.release();
			if(err) {
        res.status(400).json({
          error: "E002",
          error_message: "query 문법 오류"
        })
      }
			else {
				var keywords = [];
				for (var row of rows) {
					keywords.push(row["id"]);
				}
				callback(keywords);
			}
		})
	})
}

// uid에 해당하는 시리즈에 kid_list에 있는 kid에 해당하는 키워드를 추가.
function postUserKeyword (uid, kid_list, index, callback) {
	app.getConnectionPool((conn) => {
		var sql = "insert into `LIKE` values (" + uid + ", " + kid_list[index] + ")";
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(index + 1);
		})
	})
}
exports.postUserKeyword = postUserKeyword;

// uid에 해당하는 시리즈의 기존 키워드를 삭제한 뒤 새로운 키워드 목록 추가.
exports.updateUserKeyword = (uid, kid_list, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from `LIKE` where uid=" + uid;
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			else if (kid_list == null) {
				callback();
			}
			else postUserKeyword(uid, kid_list, 0, callback);
		})
	})
}

/*************************************************************/
/************************** KEYWORD **************************/
/*************************************************************/

// 받은 keyword를 content로 하는 KEYWORD를 새로 추가한 뒤 추가된 키워드의 id를 가져옴.
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