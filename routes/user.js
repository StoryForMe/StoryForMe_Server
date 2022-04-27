const router = require('.');
var router = express.Router();
const app = require('../app');

router.get('/:login-method/:email', (req, res) => {
  app.getConnectionPool((conn) => {
    var sql = "select * from USER where login_method=" + req.params.login-method + "and email=" + req.params.email;
    conn.query(sql, function(err, user) {
      conn.release();
      if(err) console.log("error");
      else if(!user) {
        var result = {
          id: -1
        }
        res.json(result);
      } else {
        var result = {
          id: user["id"]
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