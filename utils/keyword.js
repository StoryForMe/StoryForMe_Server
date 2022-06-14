const app = require('../app');

/************************************************************/
/************************** SERIES **************************/
/************************************************************/

// sid에 해당하는 시리즈의 키워드 목록을 가져옴.
exports.getSeriesKeyword = (sid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from KEYWORD as k join REPRESENT as r on k.id=r.kid where sid=" + sid;
		conn.query(sql, function(err, keyword_list) {
			conn.release();
			if(err) console.log(err);
			else{
				var keywords = [];
				for (var keyword of keyword_list) {
					keywords.push(keyword["id"]);
				}
				callback(keywords);
			}
		})
	})
}
// sid에 해당하는 시리즈에 kid_list에 있는 kid에 해당하는 키워드를 추가.
function createNewRepresent (sid, kid, callback) {
	app.getConnectionPool((conn) => {
		var sql = "insert into REPRESENT values (" + sid + ", '" + kid + "')";
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback();
		})
	})
}

exports.deleteKeywordFromSeries = (sid, kid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "delete from REPRESENT where sid=" + sid + " and kid ='" + kid + "'";
		conn.query(sql, function(err, results) {
			conn.release();
			if (err) console.log(err);
			callback();
		})
	})
}

exports.addKeywordToSeries = (sid, kid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select * from KEYWORD where id='" + kid + "'";
		conn.query(sql, function(err, keyword_list) {
			conn.release();
			if (err) console.log(err);
			else{
				if(keyword_list.length == 0)
					postKeyword(kid, () => { callback(); });
				else
					createNewRepresent(sid, kid, callback);
			}
		})
	})
}


/*************************************************************/
/*************************** USER ****************************/
/*************************************************************/

// uid애 해당하는 user가 like로 등록한 keyword들을 가져옴
exports.getUserKeyword = (uid, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "select content from KEYWORD as k join `LIKE` as l on k.id=l.kid where uid=" + uid;
		conn.query(sql, function(err, rows) {
			conn.release();
			if(err) console.log("getUserKeyword " + err);
			else {
				var keywords = [];
				for (var row of rows) {
					keywords.push(row["content"]);
				}
				callback(keywords);
			}
		})
	})
}

// uid에 해당하는 시리즈에 kid_list에 있는 kid에 해당하는 키워드를 추가.
exports.postUserKeyword = (uid, kid_list, index, callback) => {
	app.getConnectionPool((conn) => {
		var sql = "insert into `LIKE` values (" + uid + ", " + kid_list[index] + ")";
		conn.query(sql, function(err, results) {
			conn.release();
			if(err) console.log(err);
			else callback(index + 1);
		})
	})
}

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