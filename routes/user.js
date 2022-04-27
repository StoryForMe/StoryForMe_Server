var express = require('express');
var router = express.Router();
const app = require('../app');

router.get('/:login/:email', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where login_method=" + req.params.login + " and email='" + req.params.email +"'";
    console.log(sql);
    conn.query(sql, function(err, [user]) {
      conn.release();
      console.log(user);
      if(err) console.log("error");
      else if(!user[0]) {
        var result = {
          id: -1
        }
        res.json(result);
      } else {
        var result = {
          id: user[0]["id"]
        }
        res.json(result);
      }
    })
  })
})

exports.getNickname = (uid, callback) => {
	return app.getConnectionPool((conn) => {
		var sql = "select nickname from USER where id=" + uid;
		conn.query(sql, function(err, [row]) {
			conn.release();
			if(err) console.log("getNickname err");
			else callback(row["nickname"]);
		})
	})
}

module.exports = router;